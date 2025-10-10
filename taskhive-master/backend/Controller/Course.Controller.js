const createError = require('http-errors')
const Model = require('../Models/Course.Model.js')
const mongoose = require('mongoose')
const Razorpay = require('razorpay');
const crypto = require('crypto');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const ModelName = 'CourseQuery'

// --- INITIALIZE RAZORPAY ---
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Helper function to normalize paths
const normalizePath = (filePath) => {
  if (!filePath) return filePath;
  return filePath.replace(/\\/g, '/').replace(/\/\//g, '/');
};

// Helper function to generate PDF receipt and save it
const generateAndSaveReceipt = async (courseQuery) => {
  return new Promise((resolve, reject) => {
    try {
      // Create receipts directory if it doesn't exist
      const receiptsDir = path.join(__dirname, '../uploads/receipts');
      if (!fs.existsSync(receiptsDir)) {
        fs.mkdirSync(receiptsDir, { recursive: true });
      }

      const fileName = `receipt-${courseQuery.razorpay_payment_id}.pdf`;
      const filePath = path.join(receiptsDir, fileName);
      const normalizedPath = normalizePath(`/uploads/receipts/${fileName}`);

      // Create PDF
      const doc = new PDFDocument();
      const writeStream = fs.createWriteStream(filePath);

      doc.pipe(writeStream);

      // Add content to PDF
      doc.fontSize(20).text('PAYMENT RECEIPT', 100, 100);
      doc.fontSize(12);
      
      doc.text(`Receipt No: ${courseQuery.razorpay_payment_id}`, 100, 150);
      doc.text(`Date: ${new Date(courseQuery.payment_date || Date.now()).toLocaleDateString()}`, 100, 170);
      doc.text('', 100, 190);
      
      doc.text(`Student Name: ${courseQuery.name}`, 100, 210);
      doc.text(`Email: ${courseQuery.email}`, 100, 230);
      doc.text(`Phone: ${courseQuery.countryCode} ${courseQuery.number}`, 100, 250);
      doc.text('', 100, 270);
      
      doc.text(`Course: ${courseQuery.course}`, 100, 290);
      doc.text(`Bundle Purchased: ${courseQuery.bundle_purchased ? 'Yes' : 'No'}`, 100, 310);
      doc.text('', 100, 330);
      
      doc.fontSize(14).text('Payment Details:', 100, 350);
      doc.fontSize(12);
      doc.text(`Amount: ₹${courseQuery.total_amount}`, 100, 370);
      doc.text(`Payment Status: ${courseQuery.payment_status}`, 100, 390);
      doc.text(`Transaction ID: ${courseQuery.razorpay_payment_id}`, 100, 410);
      doc.text(`Order ID: ${courseQuery.razorpay_order_id}`, 100, 430);
      doc.text('', 100, 450);
      
      doc.fontSize(10).text('Thank you for your payment!', 100, 480);
      doc.text('This is a computer-generated receipt and does not require a signature.', 100, 500);

      doc.end();

      writeStream.on('finish', () => {
        console.log('Receipt saved successfully:', normalizedPath);
        resolve(normalizedPath);
      });

      writeStream.on('error', (error) => {
        console.error('Error saving receipt:', error);
        reject(error);
      });

    } catch (error) {
      console.error('Error generating receipt:', error);
      reject(error);
    }
  });
};

module.exports = {
  create: async (req, res, next) => {
    try {
      const data = req.body;
      const newData = new Model(data);
      const result = await newData.save();

      // --- CREATE RAZORPAY ORDER ---
      const options = {
        amount: Math.round(data.total_amount * 100),
        currency: "INR",
        receipt: result._id.toString()
      };

      razorpayInstance.orders.create(options, function(err, order) {
        if (err) {
          console.error("Razorpay order creation error:", err);
          return next(createError.InternalServerError("Could not create payment order."));
        }
        
        Model.findByIdAndUpdate(result._id, {
          razorpay_order_id: order.id
        }).then(() => {
          res.json({
            message: "User data saved, proceed to payment.",
            userData: { ...result._doc, razorpay_order_id: order.id },
            razorpayOrder: order
          });
        });
      });

    } catch (error) {
      next(error);
    }
  },

  // --- UPDATED verifyPayment METHOD WITH RECEIPT GENERATION ---
  verifyPayment: async (req, res, next) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;
        const queryId = req.params.id;

        // Verify payment signature
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        const generated_signature = hmac.digest('hex');

        if (generated_signature === razorpay_signature) {
            // Signature is valid - update payment status
            const updatedDoc = await Model.findByIdAndUpdate(queryId, {
                $set: {
                    payment_status: 'successful',
                    razorpay_payment_id: razorpay_payment_id,
                    razorpay_signature: razorpay_signature,
                    payment_date: new Date()
                }
            }, { new: true });

            // Generate and save receipt
            try {
              const receiptPath = await generateAndSaveReceipt(updatedDoc);
              
              // Update document with receipt path
              await Model.findByIdAndUpdate(queryId, {
                $set: { payment_receipt: receiptPath }
              });

              console.log('Receipt generated and saved at:', receiptPath);

              res.json({ 
                  success: true, 
                  message: "Payment verified successfully.", 
                  userData: { ...updatedDoc._doc, payment_receipt: receiptPath },
                  receiptPath: receiptPath
              });

            } catch (receiptError) {
              console.error('Error generating receipt:', receiptError);
              // Payment is still successful even if receipt generation fails
              res.json({ 
                  success: true, 
                  message: "Payment verified successfully, but receipt generation failed.", 
                  userData: updatedDoc
              });
            }

        } else {
            // Signature is invalid
            await Model.findByIdAndUpdate(queryId, {
                $set: { payment_status: 'failed' }
            });
            res.status(400).json({
                success: false,
                message: "Payment verification failed. Signature mismatch."
            });
        }
    } catch (error) {
        console.error("Payment verification error:", error);
        next(error);
    }
  },

  // --- UPDATED downloadReceipt METHOD ---
  downloadReceipt: async (req, res, next) => {
    try {
        const { id } = req.params;
        
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            throw createError.BadRequest('Invalid or missing ID');
        }

        const courseQuery = await Model.findById(id);
        if (!courseQuery) {
            throw createError.NotFound('Course query not found');
        }

        if (courseQuery.payment_status !== 'successful') {
            throw createError.BadRequest('Payment not completed for this order');
        }

        // Check if receipt file exists
        if (courseQuery.payment_receipt) {
          const filePath = path.join(__dirname, '..', courseQuery.payment_receipt);
          
          if (fs.existsSync(filePath)) {
            // Send existing receipt file
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=receipt-${courseQuery.razorpay_payment_id}.pdf`);
            return res.sendFile(filePath);
          }
        }

        // If no receipt exists, generate one on-the-fly
        const doc = new PDFDocument();
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=receipt-${courseQuery.razorpay_payment_id}.pdf`);
        
        doc.pipe(res);

        // Add content to PDF
        doc.fontSize(20).text('PAYMENT RECEIPT', 100, 100);
        doc.fontSize(12);
        
        doc.text(`Receipt No: ${courseQuery.razorpay_payment_id}`, 100, 150);
        doc.text(`Date: ${new Date(courseQuery.payment_date || Date.now()).toLocaleDateString()}`, 100, 170);
        doc.text('', 100, 190);
        
        doc.text(`Student Name: ${courseQuery.name}`, 100, 210);
        doc.text(`Email: ${courseQuery.email}`, 100, 230);
        doc.text(`Phone: ${courseQuery.countryCode} ${courseQuery.number}`, 100, 250);
        doc.text('', 100, 270);
        
        doc.text(`Course: ${courseQuery.course}`, 100, 290);
        doc.text(`Bundle Purchased: ${courseQuery.bundle_purchased ? 'Yes' : 'No'}`, 100, 310);
        doc.text('', 100, 330);
        
        doc.fontSize(14).text('Payment Details:', 100, 350);
        doc.fontSize(12);
        doc.text(`Amount: ₹${courseQuery.total_amount}`, 100, 370);
        doc.text(`Payment Status: ${courseQuery.payment_status}`, 100, 390);
        doc.text(`Transaction ID: ${courseQuery.razorpay_payment_id}`, 100, 410);
        doc.text(`Order ID: ${courseQuery.razorpay_order_id}`, 100, 430);
        doc.text('', 100, 450);
        
        doc.fontSize(10).text('Thank you for your payment!', 100, 480);
        doc.text('This is a computer-generated receipt and does not require a signature.', 100, 500);

        doc.end();

    } catch (error) {
        console.error('Receipt download error:', error);
        next(error);
    }
  },

  // --- EXISTING METHODS ---
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