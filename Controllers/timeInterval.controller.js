const createError = require("http-errors");
const Model = require("../Models/timeInterval.model");
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
          const existingData = await Model.updateOne(
            { _id: mongoose.Types.ObjectId(dataExists._id) },
            { $set: { is_active: false } }
          );
          if (existingData) {
            console.log(`Existing ${dataExists.contentType} has be Disabled`);
          }
        }
      const newData = new Model(data);
      const result = await newData.save();
      if (result) {
        const resData = await Model.find(
          { is_active: true },
          { keyName: 1, minutes: 1, seconds: 1 }
        );
        let newData = resData
          .filter((object) => object.seconds !== undefined)
          .map((object) => ({
            key: object.keyName,
            time: object.minutes + ":" + object.seconds,
          }));
        let outputObject = {};
        newData.forEach(({ key, time }) => {
          let [minutes, seconds] = (time || "0:0")
            .split(":")
            .map((val) => parseInt(val) || 0);

          if (key === "non_assisted_timing") {
            outputObject[key] = `${minutes}:${seconds
              .toString()
              .padStart(2, "0")}`;
          } else {
            outputObject[key] = seconds;
          }
        });
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
              "http://20.219.158.85:6066/api/vkyc/controlpanel/timing",
              outputObject,
              config
            )
            .then(
              (response) => {
                console.log('response', response.data)
                if (response.data.status == "success") {
                  res.send({
                    success: true,
                    msg: "Data submitted successfully",
                  });
                } else {
                  res.send({
                    success: false,
                    msg: "Failed to Submit Data in Video KYC",
                  });
                }
              },
              (error) => {
                console.log(error);
              }
            );
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
      if(is_active){
        query.is_active = true
      }
      const result = await Model.aggregate([
        {
          $match: query,
        },
        {
          $sort: {
            is_active: -1, 
          },
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
          { keyName: 1, minutes: 1, seconds: 1 }
        );
        let newData = resData
          .filter((object) => object.seconds !== undefined)
          .map((object) => ({
            key: object.keyName,
            time: object.minutes + ":" + object.seconds,
          }));
        let outputObject = {};
        newData.forEach(({ key, time }) => {
          let [minutes, seconds] = (time || "0:0")
            .split(":")
            .map((val) => parseInt(val) || 0);

          if (key === "non_assisted_timing") {
            outputObject[key] = `${minutes}:${seconds
              .toString()
              .padStart(2, "0")}`;
          } else {
            outputObject[key] = seconds;
          }
        });
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
              "http://20.219.158.85:6066/api/vkyc/controlpanel/timing",
              outputObject,
              config
            )
            .then(
              (response) => {
                if (response.data.status == "succces") {
                  res.send({
                    success: true,
                    msg: "Data submitted successfully",
                  });
                } else {
                  res.send({
                    success: false,
                    msg: "Failed to Submit Data in Video KYC",
                  });
                }
              },
              (error) => {
                console.log(error);
              }
            );
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
