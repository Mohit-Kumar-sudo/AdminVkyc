const createError = require("http-errors");
const Model = require("../Models/content.model");
const activityModel = require("../Models/activityLog.model");
const mongoose = require("mongoose");
const ModelName = "Content";
const axios = require("axios");

module.exports = {
  create: async (req, res, next) => {
    try {
      const data = req.body;
      data.created_by = req.user ? req.user : 'unauth';
      data.updated_by = req.user ? req.user : 'unauth';
      data.created_at = Date.now();
  
      const dataExists = await Model.findOne({
        contentTypeEn: data.contentTypeEn,
        vkycTypeEn: data.vkycTypeEn,
        is_active: true,
      }).lean();
  
      if (dataExists) {
        await Model.updateOne(
          { _id: mongoose.Types.ObjectId(dataExists._id) },
          { $set: { is_active: false } }
        );
        console.log(`Existing ${dataExists.contentTypeEn} has been Disabled`);
      }
      
      const newData = new Model(data);
      const result = await newData.save();
      
      if (result) {
        const resData = await Model.find(
          { is_active: true },
          {
            contentTypeEn: 1,
            contentTypeHi: 1,
            vkycTypeEn: 1,
            vkycTypeHi: 1,
            content_english: 1,
            content_hindi: 1,
          }
        );
        let newData = {
          Assisted: {
            do_and_donts: {},
            terms_conditions: {},
            prerequisites: {}
          },
          Non_Assisted: {
            do_and_donts: {},
            terms_conditions: {},
            prerequisites: {}
          }
        };
        
        for (const item of resData) {
          const key = item.vkycTypeEn === "Assisted" ? "Assisted" : "Non_Assisted";
          const contentTypeEn = item.contentTypeEn;
        
          if (contentTypeEn === "Do's and Don'ts") {
            newData[key].do_and_donts = {
              English: item.content_english[0] ? item.content_english[0].split('\n') : [],
              Hindi: item.content_hindi[0] ? item.content_hindi[0].split('\n') : []
            };
          }
          if (contentTypeEn === "Terms and Condition") {
            newData[key].terms_conditions = {
              English: item.content_english[0] ? item.content_english[0].split('\n') : [],
              Hindi: item.content_hindi[0] ? item.content_hindi[0].split('\n') : []
            };
          }
          if (contentTypeEn === "Prerequisites") {
            newData[key].prerequisites = {
              English: item.content_english[0] ? item.content_english[0].split('\n') : [],
              Hindi: item.content_hindi[0] ? item.content_hindi[0].split('\n') : []
            };
          }
        }
        
        const config = {
          headers: {
             "x-parse-application-id": "mdpinfraindiapvtltd_vcip_liv",
              "x-parse-rest-api-key": "eb9d18a4478424e2cafccae3a61fb586",
              "content-type": "application/json",
          }
        };
  
        axios.post('http://10.115.204.28:8066/api/vkyc/controlpanel/content', newData, config)
          .then(async function (response) {
            if (response.data.status == 'success') {
              res.send({ success: true, msg: 'Data submitted successfully', data: newData });
            } else {
              await Model.updateOne(
                { _id: mongoose.Types.ObjectId(result._id) },
                { $set: { is_active: false } }
              );
              console.log(`Existing ${result.contentTypeEn} has been Disabled`);
              res.send({ success: false, msg: 'Failed to Submit Data' });
            }
          })
          .catch(function (error) {
            console.log(error);
            res.send({ success: false, msg: 'Failed to Submit Data' });
          });
  
      } else {
        res.send({ success: false, msg: "Failed to insert data." });
      }
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      console.log(error);
      res.send({ success: false, msg: 'An error occurred while processing the request' });
    }
  },
  get: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw createError.BadRequest("Invalid Parameters");
      }
      const result = await Model.findById({ _id: mongoose.Types.ObjectId(id) });
      if (!result) {
        throw createError.NotFound(`No ${ModelName} Found`);
      }
      if (result) {
        res.send({ success: true, msg: "Detail Fetched", data: result });
      } else {
        res.send({ success: false, msg: "Failed to Fetch Detail" });
      }
    } catch (error) {
      if (error.isJoi === true)
        return next(createError.BadRequest("Bad Request"));
      next(error);
    }
  },
  list: async (req, res, next) => {
    try {
      const { name, is_active, page, limit, sort, contentTypeEn, vkycTypeEn } =
        req.query;
      const _page = page ? parseInt(page) : 1;
      const _limit = limit ? parseInt(limit) : 20;
      const _skip = (_page - 1) * _limit;
      const _sort = sort ? sort : "+name";
      const query = {};
      if (name) {
        query.name = new RegExp(name, "i");
      }
      if (is_active) {
        query.is_active = is_active && is_active == "true" ? true : false;
      }
      if (vkycTypeEn) {
        query.vkycTypeEn = vkycTypeEn;
      }
      if (contentTypeEn) {
        query.contentTypeEn = contentTypeEn;
      }
      const result = await Model.aggregate([
        {
          $match: query,
        },
        {
          $skip: _skip,
        },
      ]);
      if (result) {
        res.send({
          success: true,
          msg: "Data Fetched",
          data: result,
          count: result.length,
        });
      } else {
        res.send({ success: false, msg: "Failed to Fetch Data" });
      }
    } catch (error) {
      if (error.isJoi === true)
        return next(createError.BadRequest("Bad Request"));
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = req.body;

      if (!id) {
        throw createError.BadRequest("Invalid Parameters");
      }
      if (!data) {
        throw createError.BadRequest("Invalid Parameters");
      }
      data.updated_at = Date.now();

      const result = await Model.findOne({ _id: mongoose.Types.ObjectId(id) });
      const newData = {
        contentTypeEn: result.contentTypeEn,
        contentTypeHi: result.contentTypeHi,
        vkycTypeEn: result.vkycTypeEn,
        vkycTypeHi: result.vkycTypeHi,
        content_english: result.content_english,
        content_hindi: result.content_hindi,
        is_active: false,
        updated_at: Date.now(),
        created_at: Date.now(),
      };
      const newUpdatedData = new Model(newData);
      const newResult = await newUpdatedData.save();

      const updateData = await Model.updateOne(
        { _id: mongoose.Types.ObjectId(id) },
        { $set: data }
      );

      if (newResult) {
        const resData = await Model.find(
          { is_active: true },
          {
            contentTypeEn: 1,
            contentTypeHi: 1,
            vkycTypeEn: 1,
            vkycTypeHi: 1,
            content_english: 1,
            content_hindi: 1,
          }
        );
        let newData = {
          Assisted: {
            do_and_donts: {},
            terms_conditions: {},
            prerequisites: {}
          },
          Non_Assisted: {
            do_and_donts: {},
            terms_conditions: {},
            prerequisites: {}
          }
        };
        
        for (const item of resData) {
          const key = item.vkycTypeEn === "Assisted" ? "Assisted" : "Non_Assisted";
          const contentTypeEn = item.contentTypeEn;
        
          if (contentTypeEn === "Do's and Don'ts") {
            newData[key].do_and_donts = {
              English: item.content_english[0] ? item.content_english[0].split('\n') : [],
              Hindi: item.content_hindi[0] ? item.content_hindi[0].split('\n') : []
            };
          }
          if (contentTypeEn === "Terms and Condition") {
            newData[key].terms_conditions = {
              English: item.content_english[0] ? item.content_english[0].split('\n') : [],
              Hindi: item.content_hindi[0] ? item.content_hindi[0].split('\n') : []
            };
          }
          if (contentTypeEn === "Prerequisites") {
            newData[key].prerequisites = {
              English: item.content_english[0] ? item.content_english[0].split('\n') : [],
              Hindi: item.content_hindi[0] ? item.content_hindi[0].split('\n') : []
            };
          }
        }
        try {
          const config = {
            headers: {
             "x-parse-application-id": "mdpinfraindiapvtltd_vcip_liv",
              "x-parse-rest-api-key": "eb9d18a4478424e2cafccae3a61fb586",
              "content-type": "application/json",
            }
          };
    
          axios.post("http://10.115.204.28:8066/api/vkyc/controlpanel/content", newData, config)
            .then(async function (response) {
              if (response.data.status == 'success') {
                res.send({ success: true, msg: 'Data submitted successfully', data: newData });
              } else {
                await Model.updateOne(
                  { _id: mongoose.Types.ObjectId(id) },
                  { $set: { is_active: false } }
                );
                console.log(`Existing ${newData.contentTypeEn} has been Disabled`);
                res.send({ success: false, msg: 'Failed to Update Data' });
              }
            })
        } catch (error) {
          next(error);
        }
      } else {
        res.send({ success: false, msg: "Failed to Update Data" });
      }
    } catch (error) {
      if (error.isJoi === true)
        return next(createError.BadRequest("Bad Request"));
      next(error);
    }
  },
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw createError.BadRequest("Invalid Parameters");
      }
      const deleted_at = Date.now();
      const result = await Model.deleteOne(
        { _id: mongoose.Types.ObjectId(id) },
        { $set: { is_active: false, deleted_at } }
      );
      if (result) {
        res.send({ success: true, msg: "Data Deleted Successfully" });
      } else {
        res.send({ success: false, msg: "Failed to Delete Data" });
      }
    } catch (error) {
      if (error.isJoi === true)
        return next(createError.BadRequest("Bad Request"));
      next(error);
    }
  },
  restore: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw createError.BadRequest("Invalid Parameters");
      }
      const restored_at = Date.now();
      const oldData = await Model.findById({
        _id: mongoose.Types.ObjectId(id),
      });
      if (oldData) {
        const newQuery = await Model.findOne({
          contentTypeEn: oldData.contentTypeEn,
          vkycTypeEn: oldData.vkycTypeEn,
          is_active: true,
        });
        if (newQuery) {
          console.log(newQuery);
          const result = await Model.findByIdAndUpdate(
            { _id: mongoose.Types.ObjectId(newQuery._id) },
            { $set: { is_active: false } }
          );
        }
      }
      const result = await Model.updateOne(
        { _id: mongoose.Types.ObjectId(id) },
        { $set: { is_active: true, restored_at } }
      );
      if (result) {
        res.send({ success: true, msg: "Data Restored Successfully" });
      } else {
        res.send({ success: false, msg: "Failed to Restore Data" });
      }
    } catch (error) {
      if (error.isJoi === true)
        return next(createError.BadRequest("Bad Request"));
      next(error);
    }
  },
};
