const createError = require('http-errors')
const Model = require('../Models/Course.Model.js')
const mongoose = require('mongoose')
const Razorpay = require('razorpay');
const crypto = require('crypto');

const ModelName = 'CourseQuery'

// --- INITIALIZE RAZORPAY ---
// Make sure to add these to your environment variables (.env file)
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
// --- END RAZORPAY INITIALIZATION ---

module.exports = {
  // --- UPDATED create METHOD ---
  create: async (req, res, next) => {
    try {
      const data = req.body;
      // User data is now saved with a 'pending' payment status
      const newData = new Model(data);
      const result = await newData.save();

      // --- CREATE RAZORPAY ORDER ---
      const options = {
        amount: data.total_amount * 100, // amount in the smallest currency unit (paise)
        currency: "INR",
        receipt: result._id.toString() // Use the new MongoDB document ID as the receipt
      };

      razorpayInstance.orders.create(options, function(err, order) {
        if (err) {
          console.error("Razorpay order creation error:", err);
          return next(createError.InternalServerError("Could not create payment order."));
        }
        // Add razorpay_order_id to our document and send it back
        result.razorpay_order_id = order.id;
        result.save().then(() => {
           res.json({
             message: "User data saved, proceed to payment.",
             userData: result,
             razorpayOrder: order
           });
        });
      });

    } catch (error) {
      next(error);
    }
  },

  // --- NEW: verifyPayment METHOD ---
  verifyPayment: async (req, res, next) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;
        const queryId = req.params.id; // The ID of our course-query document

        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        const generated_signature = hmac.digest('hex');

        if (generated_signature === razorpay_signature) {
            // Signature is valid, update the document
            const updatedDoc = await Model.findByIdAndUpdate(queryId, {
                $set: {
                    payment_status: 'successful',
                    razorpay_payment_id: razorpay_payment_id,
                    razorpay_signature: razorpay_signature
                }
            }, { new: true });
            
            // Here you can trigger sending a confirmation email, etc.

            res.json({ success: true, message: "Payment verified successfully.", data: updatedDoc });

        } else {
            // Signature is invalid
            await Model.findByIdAndUpdate(queryId, {
                $set: { payment_status: 'failed' }
            });
            throw createError.BadRequest("Payment verification failed. Signature mismatch.");
        }
    } catch (error) {
        next(error);
    }
  },

  get: async (req, res, next) => {
    try {
      const { id } = req.params
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw createError.BadRequest('Invalid or missing ID')
      }
      const result = await Model.findById(id)
      if (!result) {
        throw createError.NotFound(`No ${ModelName} Found`)
      }
      res.send({ success: true, data: result })
    } catch (error) {
      next(error)
    }
  },

  list: async (req, res, next) => {
    try {
      const { name, page, limit, sort } = req.query
      const _page = page ? parseInt(page) : 1
      const _limit = limit ? parseInt(limit) : 20
      const _skip = (_page - 1) * _limit
      const _sort = sort ? sort : '+name'
      const query = {}

      if (name) {
        query.name = new RegExp(name, 'i')
      }
      query.is_active = true

      const result = await Model.aggregate([
        { $match: query },
        { $skip: _skip },
        { $limit: _limit }
      ])

      res.json(result)
    } catch (error) {
      next(error)
    }
  },

  update: async (req, res, next) => {
    try {
      const { id } = req.params
      const data = req.body

      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw createError.BadRequest('Invalid or missing ID')
      }
      if (!data) {
        throw createError.BadRequest('No update data provided')
      }
      data.updated_at = Date.now()
      const result = await Model.updateOne({ _id: id }, { $set: data })
      res.json(result)
    } catch (error) {
      next(error)
    }
  },

  delete: async (req, res, next) => {
    try {
      const { id } = req.params
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw createError.BadRequest('Invalid or missing ID')
      }
      const deleted_at = Date.now()
      const result = await Model.updateOne({ _id: id }, { $set: { is_active: false, deleted_at } })
      res.json(result)
    } catch (error) {
      next(error)
    }
  },

  restore: async (req, res, next) => {
    try {
      const { id } = req.params
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw createError.BadRequest('Invalid or missing ID')
      }
      const dataToBeRestored = await Model.findOne({ _id: id, is_active: false }).lean()
      if (!dataToBeRestored) {
        throw createError.NotFound(`${ModelName} Not Found or Already Active`)
      }
      const restored_at = Date.now()
      const result = await Model.updateOne({ _id: id }, { $set: { is_active: true, restored_at } })
      res.json({ success: true, message: `${ModelName} restored successfully`, result })
    } catch (error) {
      next(error)
    }
  }
}
