const createError = require("http-errors");
const Model = require("../Models/matrix.model");
const mongoose = require("mongoose");
const ModelName = "Content";
const axios = require("axios");

module.exports = {
  create: async (req, res, next) => {
    try {
      const data = req.body;
      data.created_by = req.user ? req.user : "unauth";
      data.updated_by = req.user ? req.user : "unauth";
      data.created_at = Date.now();
      const dataExists = await Model.findOne({
        contentEn: data.contentEn,
        is_active: true,
      }).lean();
      if (dataExists) {
        await Model.updateOne(
          { _id: mongoose.Types.ObjectId(dataExists._id) },
          { $set: { is_active: false } }
        );
        console.log(`Existing ${dataExists.contentType} has been Disabled`);
      }
      const newData = new Model(data);
      const result = await newData.save();

      if (result) {
        const resData = await Model.find(
          { is_active: true },
          { keyName: 1, percentage: 1 }
        );
        let formatData = [];
        for (const object of resData) {
          const transformed = object.keyName + ":" + object.percentage;
          formatData.push(transformed);
        }
        let reqResult = formatData.reduce((acc, ele) => {
          let [key, value] = ele.split(":");
          acc[key] = value;
          return acc;
        }, {});
        try {
          const config = {
            headers: {
              "x-parse-application-id": "MPSEDC_UAT",
              "x-parse-rest-api-key": "5eefa031319958005f14c3cba94",
              "content-type": "application/json",
            },
          };
          axios
            .post(
              "http://10.115.206.78:6066/api/vkyc/controlpanel/matching",
              reqResult,
              config
            )
            .then(async function (response) {
              if (response.data.status == "success") {
                res.send({ success: true, msg: "Data submitted successfully" });
              } else {
                await Model.updateOne(
                  { _id: mongoose.Types.ObjectId(newData._id) },
                  { $set: { is_active: false } }
                );
                console.log(
                  `Existing ${newData.contentTypeEn} has been Disabled`
                );
                res.send({ success: false, msg: "Failed to Submit Data" });
              }
            });
        } catch (error) {
          next(error);
        }
      }
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
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
      const { name, is_active, page, limit, sort } = req.query;
      const _page = page ? parseInt(page) : 1;
      const _limit = limit ? parseInt(limit) : 20;
      const _skip = (_page - 1) * _limit;
      const _sort = sort ? sort : "+name";
      const query = {};
      if (name) {
        query.name = new RegExp(name, "i");
      }
      if (is_active) {
        query.is_active = true;
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
      const result = await Model.updateOne(
        { _id: mongoose.Types.ObjectId(id) },
        { $set: data }
      );
      if (result) {
        const resData = await Model.find(
          { is_active: true },
          { keyName: 1, percentage: 1 }
        );
        let formatData = [];
        for (const object of resData) {
          const transformed =
            object.keyName + ":" + '"' + object.percentage + '"';
          formatData.push(transformed);
        }
        let newResult = formatData.reduce((acc, ele) => {
          let [key, value] = ele.split(":");
          let [a, b] = value.replace(/^"|"$/g, "").split(":");
          acc[key] = a;
          return acc;
        }, {});
        try {
          const config = {
            headers: {
              "x-parse-application-id": "MPSEDC_UAT",
              "x-parse-rest-api-key": "5eefa031319958005f14c3cba94",
              "content-type": "application/json",
            },
          };
          axios
            .post(
              "http://10.115.206.78:6066/api/vkyc/controlpanel/matching",
              newResult,
              config
            )
            .then(async function (response) {
              if (response.data.status == "success") {
                res.send({
                  success: true,
                  msg: "Data Updated successfully",
                  data: newResult,
                });
              } else {
                await Model.updateOne(
                  { _id: mongoose.Types.ObjectId(id) },
                  { $set: { is_active: false } }
                );
                console.log(
                  `Existing ${result.contentTypeEn} has been Disabled`
                );
                res.send({ success: false, msg: "Failed to Update Data" });
              }
            });
        } catch (error) {
          next(error);
        }
      }
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
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
      const result = await Model.updateOne(
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
