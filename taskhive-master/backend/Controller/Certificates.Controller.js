const createError = require('http-errors')
const Model = require('../Models/Certificates.Model')
const mongoose = require('mongoose')
const ModelName = 'certificates'

module.exports = {

  create: async (req, res, next) => {
    try {
      const data = req.body
      data.created_by = req.user ? req.user._id : 'unauth'
      data.updated_by = req.user ? req.user._id : 'unauth'
      data.created_at = Date.now()
      const newData = new Model(data)
      const result = await newData.save()
      res.json(newData)
      return
    } catch (error) {
      next(error)
    }
  },
  
  get: async (req, res, next) => {
    try {
      const { id } = req.params
      if (!id) {
        throw createError.BadRequest('Invalid Parameters')
      }
      const result = await Model.findById(new mongoose.Types.ObjectId(id));
      if (!result) {
        throw createError.NotFound(`No ${ModelName} Found`)
      }
      res.send({
        success: true, data: result,
      })
      return
    } catch (error) {
      next(error)
    }
  },

  publicGet: async (req, res, next) => {
  try {
    const { id } = req.params
    if (!id) {
      throw createError.BadRequest('Invalid Parameters')
    }
    
    // Check if it's a valid ObjectId, otherwise search by certification_id
    let query;
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: new mongoose.Types.ObjectId(id) };
    } else {
      query = { certification_id: id };
    }
    // Only active & published certificates are visible publicly
    query.is_active = true;
    query.status = 'active';
    const result = await Model.aggregate([
      {
        $match: query
      },
      {
        $lookup: {
          from: 'users',
          localField: 'created_by',
          foreignField: '_id',
          as: 'created_by'
        }
      },
      {
        $unwind: {
          path: '$created_by',
          preserveNullAndEmptyArrays: true
        }
      },// Project only fields you want to expose publicly
      {
          $project: {
          certification_id: 1,
          user_id: 1,              // ADD THIS
          server_id: 1,            // ADD THIS
          lms_id: 1,               // ADD THIS
          'First Name': 1,
          'Last Name': 1,
          'Course Title': 1,       // FIX: was 'Certificate Title'
          course_id: 1,            // ADD THIS
          certification_date: 1,
          status: 1,
          created_by: { _id: 1, name: 1 }
         }
        }
    ])
    
    if (!result || result.length === 0) {
      throw createError.NotFound(`No Certificate Found`)
    }
    
    res.send({
      success: true, 
      data: result[0]
    })
    
  } catch (error) {
    next(error)
  }
},

  // Admin/private list (owner-only)
  list: async (req, res, next) => {
    try {
      const { name, page, limit, sort } = req.query;
      const _page = page ? parseInt(page) : 1;
      const _limit = limit ? Math.min(parseInt(limit), 100) : 20; // cap limit
      const _skip = (_page - 1) * _limit;
      const _sortObj = {};
      if (sort) {
        // example: "+name" or "-created_at"
        const direction = sort.startsWith('-') ? -1 : 1;
        const key = sort.replace(/^[+-]/, '');
        _sortObj[key] = direction;
      } else {
        _sortObj.created_at = -1;
      }

      const query = {};
      if (name) query['Certificate Title'] = new RegExp(name, 'i');

      // Owner-only list
      if (!req.user || !req.user._id) return next(createError.Unauthorized());
      query.created_by =new mongoose.Types.ObjectId(req.user._id);

      query.is_active = true;

      const pipeline = [
        { $match: query },
        {
          $lookup: {
            from: 'users',
            localField: 'created_by',
            foreignField: '_id',
            as: 'created_by'
          }
        },
        { $unwind: { path: '$created_by', preserveNullAndEmptyArrays: true } },
        { $sort: _sortObj },
        { $skip: _skip },
        { $limit: _limit }
      ];

      const result = await Model.aggregate(pipeline);
      const total = await Model.countDocuments(query);

      res.json({
        success: true,
        data: result,
        pagination: {
          page: _page,
          limit: _limit,
          total,
          pages: Math.ceil(total / _limit)
        }
      });
      return;
    } catch (error) {
      next(error);
    }
  },

  // Public list (searchable, but be careful exposing data)
  publicList: async (req, res, next) => {
    try {
      const { page, limit, search } = req.query;
      const _page = page ? parseInt(page) : 1;
      const _limit = limit ? Math.min(parseInt(limit), 500) : 100; // cap / protect resources
      const _skip = (_page - 1) * _limit;

      const query = { is_active: true, status: 'active' };

      if (search) {
        const regex = new RegExp(search, 'i');
        query.$or = [
          { certification_id: regex },
          { 'First Name': regex },
          { 'Last Name': regex },
          { 'Course Title': regex }
        ];
      }

      const pipeline = [
        { $match: query },
        {
          $project: {
          certification_id: 1,
          user_id: 1,              // ADD THIS
          server_id: 1,            // ADD THIS
          lms_id: 1,               // ADD THIS
          'First Name': 1,
          'Last Name': 1,
          'Course Title': 1,       // FIX: was 'Certificate Title'
          course_id: 1,            // ADD THIS
          certification_date: 1,
          status: 1
          }
        },
        { $sort: { certification_date: -1 } },
        { $skip: _skip },
        { $limit: _limit }
      ];

      const result = await Model.aggregate(pipeline);
      const totalCount = await Model.countDocuments(query);

      res.json({
        success: true,
        data: result,
        pagination: {
          page: _page,
          limit: _limit,
          total: totalCount,
          pages: Math.ceil(totalCount / _limit)
        }
      });
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const { id } = req.params
      const data = req.body

      if (!id) {
        throw createError.BadRequest('Invalid Parameters')
      }
      if (!data) {
        throw createError.BadRequest('Invalid Parameters')
      }
      data.updated_at = Date.now()
      const result = await Model.updateOne({ _id: new mongoose.Types.ObjectId(id) }, { $set: data })
      res.json(result)
      return
    } catch (error) {
      next(error)
    }
  },

  delete: async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!id) {
            throw createError.BadRequest('Invalid Parameters');
        }

        // Check if the id is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw createError.BadRequest('Invalid ObjectId');
        }

        // Check if the Certificate exists
        const certificates = await Model.findById(new mongoose.Types.ObjectId(id)); // Use new here
        if (!certificates) {
            return res.status(404).json({ message: 'Certificate not found' });
        }

        // Mark the Certificate as inactive instead of deleting
        const deleted_at = Date.now();
        const result = await Model.updateOne(
            { _id: new mongoose.Types.ObjectId(id) }, // Ensure ObjectId is used properly
            { $set: { is_active: false, deleted_at } }
        );

        res.json({ success: true, message: 'Certificate marked as inactive', data: result });

    } catch (error) {
        console.error('Error in delete operation:', error.message);
        next(error);
    }
},

  restore: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw createError.BadRequest('Invalid Parameters');
      }

      const dataToBeDeleted = await Model.findOne({ _id: new mongoose.Types.ObjectId(id) }, { name: 1 }).lean();
      if (!dataToBeDeleted) {
        throw createError.NotFound(`${ModelName} Not Found`);
      }

      const dataExists = await Model.findOne({ name: dataToBeDeleted.name, is_active: false }).lean();
      if (dataExists) {
        throw createError.Conflict(`${ModelName} already exists`);
      }

      const restored_at = Date.now();
      const result = await Model.updateOne(
        { _id: mongoose.Types.ObjectId(id) },
        { $set: { is_active: true, restored_at } }
      );
      res.json(result);
      return;
    } catch (error) {
      next(error);
    }
  },

}