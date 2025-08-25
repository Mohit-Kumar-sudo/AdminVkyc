const createError = require('http-errors')
const Model = require('../Models/Carriers.Model')
const mongoose = require('mongoose')
const ModelName = 'carriers'

module.exports = {

  create: async (req, res, next) => {
    try {
      // Add detailed request validation and logging
      console.log('Request body:', JSON.stringify(req.body));
      
      // Check if all required fields are present
      const requiredFields = ['jobTitle', 'jobRole', 'jobDuration', 'jobLocation', 
                             'jobSkills', 'jobExperience', 'jobType', 
                             'jobPreference', 'jobDescription', 'jobSalary'];
      
      const missingFields = requiredFields.filter(field => !req.body[field]);
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`
        });
      }
      
      const data = req.body
      
      // Handle user ID safely
      data.created_by = req.user ? req.user._id : 'unauth'
      data.updated_by = req.user ? req.user._id : 'unauth'
      
      // Use current timestamp
      data.created_at = new Date()
      data.updated_at = new Date()
      
      console.log('Processed data before save:', JSON.stringify(data));
      
      // Create and save the new document
      const newData = new Model(data)
      const result = await newData.save()
      
      // Return success response
      return res.status(201).json({
        success: true,
        message: 'Carrier created successfully',
        data: newData
      })
    } catch (error) {
      console.error('Error in create operation:', error.message);
      
      // Handle validation errors from Mongoose
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: validationErrors
        });
      }
      
      // Handle other errors
      next(error)
    }
  },
  
  get: async (req, res, next) => {
    try {
      const { id } = req.params
      if (!id) {
        throw createError.BadRequest('Invalid Parameters')
      }
      
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid ID format'
        });
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
      
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid ID format'
        });
      }
      
      const result = await Model.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(id) }
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
        }
      ])
      
      if (!result || result.length === 0) {
        throw createError.NotFound(`No ${ModelName} Found`)
      }
      
      res.send({
        success: true, 
        data: result[0]
      })
      return
    } catch (error) {
      next(error)
    }
  },

  list: async (req, res, next) => {
    try {
      const { name, is_active, page, limit, sort } = req.query
      const _page = page ? parseInt(page) : 1
      const _limit = limit ? parseInt(limit) : 20
      const _skip = (_page - 1) * _limit
      const _sort = sort ? sort : '+name'
      const query = {};
      
      if (name) {
        query.name = new RegExp(name, 'i')
      }
      
      // Handle missing user
      if (!req.user || !req.user._id) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required'
        });
      }
      
      query.created_by = req.user._id
      query.is_active = true;
      
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
        },
        {
          $skip: _skip
        },
        {
          $limit: _limit
        }
      ])
      
      res.json({
        success: true,
        data: result,
        pagination: {
          page: _page,
          limit: _limit,
          total: await Model.countDocuments(query)
        }
      })
      return
    } catch (error) {
      next(error)
    }
  },

  publicList: async (req, res, next) => {
    try {
      // Extract pagination parameters
      const { page, limit, sort } = req.query
      const _page = page ? parseInt(page) : 1
      const _limit = limit ? parseInt(limit) : 20
      const _skip = (_page - 1) * _limit
      const _sort = sort ? sort : '-created_at' // Default sort by newest

      // Build query object with filter parameters
      const query = { is_active: true };
      
      // Filter by job type (Full Time, Contract)
      if (req.query.jobType) {
        const jobTypes = req.query.jobType.split(',');
        const typePatterns = jobTypes.map(type => new RegExp(type, 'i'));
        query.jobType = { $in: typePatterns };
      }
      
      // Filter by job preference (Remote, Onsite)
      if (req.query.jobPreference) {
        const preferences = req.query.jobPreference.split(',');
        const prefPatterns = preferences.map(pref => new RegExp(pref, 'i'));
        query.jobPreference = { $in: prefPatterns };
      }
      
      // Filter by experience ranges
      if (req.query.expRanges) {
        const ranges = req.query.expRanges.split(',');
        const expQuery = [];
        
        ranges.forEach(range => {
          if (range === '0-1') {
            expQuery.push({ jobExperience: { $gte: 0, $lte: 1 } });
          } else if (range === '1-3') {
            expQuery.push({ jobExperience: { $gt: 1, $lte: 3 } });
          } else if (range === '3-5') {
            expQuery.push({ jobExperience: { $gt: 3, $lte: 5 } });
          } else if (range === '5-8') {
            expQuery.push({ jobExperience: { $gt: 5, $lte: 8 } });
          } else if (range === '10+') {
            expQuery.push({ jobExperience: { $gte: 10 } });
          }
        });
        
        if (expQuery.length > 0) {
          query.$or = expQuery;
        }
      }
      
      // Log the query for debugging
      console.log('Query parameters:', query);
      
      // Perform the aggregation with filters
      const result = await Model.aggregate([
        { $match: query },
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
        },
        { $sort: { created_at: -1 } }, // Sort by created_at descending
        { $skip: _skip },
        { $limit: _limit }
      ]);
      
      // Count total documents for pagination
      const totalCount = await Model.countDocuments(query);
      
      // Return the response with pagination data
      res.json({
        success: true,
        data: result,
        pagination: {
          page: _page,
          limit: _limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / _limit)
        }
      });
      return;
    } catch (error) {
      console.error('Error in publicList:', error);
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
      
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid ID format'
        });
      }
      
      if (!data || Object.keys(data).length === 0) {
        throw createError.BadRequest('No data provided for update')
      }
      
      data.updated_at = new Date()
      
      const result = await Model.updateOne(
        { _id: new mongoose.Types.ObjectId(id) }, 
        { $set: data }
      )
      
      if (result.matchedCount === 0) {
        return res.status(404).json({
          success: false,
          message: `${ModelName} not found`
        });
      }
      
      res.json({
        success: true,
        message: `${ModelName} updated successfully`,
        data: result
      })
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
        return res.status(400).json({ 
          success: false,
          message: 'Invalid ObjectId' 
        });
      }

      // Check if the carriers exists
      const carriers = await Model.findById(new mongoose.Types.ObjectId(id));
      if (!carriers) {
        return res.status(404).json({ 
          success: false,
          message: `${ModelName} not found` 
        });
      }

      // Mark the carriers as inactive instead of deleting
      const deleted_at = new Date();
      const result = await Model.updateOne(
        { _id: new mongoose.Types.ObjectId(id) },
        { $set: { is_active: false, deleted_at } }
      );

      res.json({ 
        success: true, 
        message: `${ModelName} marked as inactive`, 
        data: result 
      });

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

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid ID format'
        });
      }

      const dataToBeRestored = await Model.findOne({ _id: new mongoose.Types.ObjectId(id) }).lean();
      if (!dataToBeRestored) {
        throw createError.NotFound(`${ModelName} Not Found`);
      }

      const restored_at = new Date();
      const result = await Model.updateOne(
        { _id: new mongoose.Types.ObjectId(id) },
        { $set: { is_active: true, restored_at } }
      );
      
      res.json({
        success: true,
        message: `${ModelName} restored successfully`,
        data: result
      });
      return;
    } catch (error) {
      next(error);
    }
  },
}