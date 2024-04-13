const createError = require("http-errors");
const mongoose = require("mongoose");
const ModelName = "Content";
const axios = require("axios");
const multer = require("multer");
const upload = multer().single("file");
const fs = require("fs");
const path = require("path");

module.exports = {
  getDeedCategory: async (req, res, next) => {
    try {
      axios
        .get(
          "https://10.115.204.30:8082/sampadaService/common/duty/allDeedCategory",
          {
            params: {},
          }
        )
        .then(
          function (response) {
            const deedCategory = response.data.responseData;
            if (deedCategory) {
              res.send({
                success: true,
                msg: "Detail Fetched",
                data: deedCategory,
              });
            } else {
              res.send({ success: false, msg: "Failed to Fetch Detail" });
            }
          },
          (error) => {
            next(error);
          }
        );
    } catch (error) {
      next(error);
    }
  },

  getAllDeedTypeByCategoryId: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw createError.BadRequest("Invalid Parameters");
      }
      axios
        .get(
          `https://10.115.204.30:8082/sampadaService/common/duty/getAllDeedTypeByCategoryId/${id}`,
          {}
        )
        .then(
          function (response) {
            const deedCategory = response.data;
            if (deedCategory) {
              res.send({
                success: true,
                msg: "Detail Fetched",
                data: deedCategory,
              });
            } else {
              res.send({ success: false, msg: "Failed to Fetch Detail" });
            }
          },
          (error) => {
            next(error);
          }
        );
    } catch (error) {
      next(error);
    }
  },

  deedInstruments: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw createError.BadRequest("Invalid Parameters");
      }
      axios
        .get(
          `https://10.115.204.30:8082/sampadaService/common/duty/deedInstruments/${id}`,
          {}
        )
        .then(
          function (response) {
            const deedCategory = response.data;
            if (deedCategory) {
              res.send({
                success: true,
                msg: "Detail Fetched",
                data: deedCategory,
              });
            } else {
              res.send({ success: false, msg: "Failed to Fetch Detail" });
            }
          },
          (error) => {
            next(error);
          }
        );
    } catch (error) {
      next(error);
    }
  },

  partyRoles: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw createError.BadRequest("Invalid Parameters");
      }
      axios
        .get(
          `https://10.115.204.30:8082/sampadaService/common/duty/getAllPartyTypeByInstrumentId/${id}`,
          {}
        )
        .then(
          function (response) {
            const roles = response.data.responseData;
            if (roles.length) {
              res.send({ success: true, msg: "Detail Fetched", data: roles });
            } else {
              res.send({ success: false, msg: "Failed to Fetch Detail" });
            }
          },
          (error) => {
            next(error);
          }
        );
    } catch (error) {
      next(error);
    }
  },

  userAuthenticate: async (req, res, next) => {
    try {
      const uid = req.query.uid;
      if (!uid) {
        throw createError.BadRequest("Invalid Parameters");
      }
      axios
        .post(
          `https://ersuat2.mp.gov.in/sampadaGateway/common/authenticate_redirect_department_user`,
          { uid: uid }
        )
        .then(
          function (response) {
            console.log(response);
            const resp = response.data.responseData;
            const token = response.data.token || response.data.data.token;
            const errorResponse =
              response.data.responseData || response.data.data;
            if (!token) {
              // res.redirect('http://20.198.103.152/admin?id=uid&otp=otp');
              const otp = Math.floor(1000 + Math.random() * 9000);
              // generate otp for uid and save it to validate.json file
              const filePath = path.join(__dirname, "../validate.json");
              const data = { uid, otp };
              // append data to array in file
              const fileData = fs.readFileSync(filePath);
              const fileJson = JSON.parse(fileData);
              fileJson.push(data);
              fs.writeFileSync(filePath, JSON.stringify(fileJson));
              return res.redirect(
                `http://localhost:63333/#/Authenticate/${uid}/${otp}`
              );
            } else {
              return res.send({ success: false, msg: resp || errorResponse });
            }
          },
          (error) => {
            next(error);
          }
        );
    } catch (error) {
      next(error);
    }
  },

  validateUidOtp: async (req, res, next) => {
    try {
      const { uid, otp } = req.params;
      if (!uid || !otp) {
        throw createError.BadRequest("Invalid Parameters");
      }
      const filePath = path.join(__dirname, "../validate.json");
      const fileData = fs.readFileSync(filePath);
      let fileJson = JSON.parse(fileData);
      const user = fileJson.find((u) => u.uid === uid && u.otp.toString() === otp.toString());
      console.log("fileJson", fileJson);
      console.log("user", user);
      if (user) {
        // remove user from file
        const index = fileJson.indexOf(user);
        fileJson = fileJson.filter((u) => u.uid != uid);
        fs.writeFileSync(filePath, JSON.stringify(fileJson));
        return res.send({ success: true, msg: "User Validated" });
      } else {
        return res.send({ success: false, msg: "Invalid User" });
      }
    } catch (error) {
      next(error);
    }
  },
};
