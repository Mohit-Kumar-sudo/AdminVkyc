const createError = require("http-errors");
const Users = require("../Models/User.Model");
const mongoose = require("mongoose");
const { signupSchema } = require("../Validations/user.validate");
const { signAccessToken, signRefreshToken } = require("../Helpers/jwt_helpers");
const HTTPStatus = require("http-status-codes");

module.exports = {
  signUp: async (req, res, next) => {
    try {
      const result = await signupSchema.validateAsync(req.body);
      let user = {};
      if (result) {
        user = await User.findOne({ email: result.email });
        if (!user) {
          throw createError.NotFound("User not registered");
        }
      }
      const userDetails = req.body;
      const userObj = new Users(userDetails);
      await userObj.save();
      res.json(userObj.onSuccess());
    } catch (error) {
      next(error);
    }
  },

  login: async (req, res, next) => {
    try {
      const result = req.body;
      if (!result) {
        throw createError.NotAcceptable("No query data");
      }
      let user = await Users.findOne({ email: result.email });
      if (!user) {
        throw createError.NotFound("User not registered");
      }
      console.log("user", user);
      const isMatch = await user.isValidPassword(result.password);
      if (!isMatch) {
        throw createError.NotAcceptable("Invalid username or password");
      }
      if (!user.emailConfirm) {
        await nodeMailerService.sendVerifyMail(user, req, res);
        return res
          .status(HTTPStatus.OK)
          .json({ data: "Please verify your email address first." });
      }

      if (!user.adminConfirm && user.emailConfirm) {
        return res
          .status(HTTPStatus.OK)
          .json({ data: "Your profile is awaiting administrator approval." });
      }

      if (user.adminConfirm && user.emailConfirm) {
        const accessToken = await signAccessToken(user.id);
        const refreshToken = await signRefreshToken(user.id);

        // Prepare user data to send
        const userDataSend = {
          id: user._id,
          name: user.name ? user.name : `${user.firstName  } ${  user.lastName}`,
          email: user.email,
        };

        return res.status(HTTPStatus.OK).json({
          data: {
            success: true,
            msg: "Login successful",
            token: `JWT ${accessToken}`,
            refreshToken: refreshToken,
            ...userDataSend,
          },
        });
      }
      return next();
    } catch (error) {
      if (error.isJoi === true) {
        return next(createError.BadRequest("Invalid Email/Password"));
      }
      next(error);
    }
  },

  emailConfirm: async (req, res, next) => {
    try {
      const { loginId } = req.params;
      if (!loginId) {
        throw createError.BadRequest("Invalid Parameters");
      }
      const result = await Users.updateOne(
        { _id: mongoose.Types.ObjectId(loginId) },
        { emailConfirm: 1 },
        { upsert: true }
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  getEmailConfirm: async (req, res, next) => {
    try {
      const { loginId } = req.params;
      if (!loginId) {
        throw createError.BadRequest("Invalid Parameters");
      }
      const result = await Users.findOne(
        { _id: mongoose.Types.ObjectId(loginId) },
        "emailConfirm"
      )
        .lean()
        .exec();
      if (!result) {
        throw createError.NotFound("No User Found");
      }
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  getUserFeaturedReports: async (req, res, next) => {
    try {
      const { userId } = req.params;
      if (!userId) {
        throw createError.BadRequest("Invalid Parameters");
      }
      const result = await Users.findOne(
        { _id: mongoose.Types.ObjectId(userId) },
        "featuredReportIds"
      )
        .lean()
        .exec();
      if (!result) {
        throw createError.NotFound("User Not Found");
      }
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  addDashboard: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const data = req.body;
      if (!userId || !data) {
        throw createError.BadRequest("Invalid Parameters");
      }
      const result = await Users.findByIdAndUpdate(
        mongoose.Types.ObjectId(userId),
        { $push: { myDashboards: data } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  getUserDashboards: async (req, res, next) => {
    try {
      const { userId, dashboardId } = req.params;
      if (!userId) {
        throw createError.BadRequest("Invalid Parameters");
      }
      let query;
      if (dashboardId) {
        query = Users.findOne(
          {
            _id: mongoose.Types.ObjectId(userId),
            "myDashboards._id": mongoose.Types.ObjectId(dashboardId),
          },
          { "myDashboards.$": 1, title: 1 }
        );
      } else {
        query = Users.findOne(
          { _id: mongoose.Types.ObjectId(userId) },
          "myDashboards"
        );
      }
      const result = await query.lean().exec();
      if (!result) {
        throw createError.NotFound("Dashboards Not Found");
      }
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  deleteUserDashboard: async (req, res, next) => {
    try {
      const { userId, dashboardId } = req.params;
      if (!userId || !dashboardId) {
        throw createError.BadRequest("Invalid Parameters");
      }
      const result = await Users.updateOne(
        { _id: mongoose.Types.ObjectId(userId) },
        {
          $pull: {
            myDashboards: { _id: mongoose.Types.ObjectId(dashboardId) },
          },
        }
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  storeUserPPT: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const data = req.body;
      if (!userId || !data) {
        throw createError.BadRequest("Invalid Parameters");
      }
      const result = await Users.findByIdAndUpdate(
        mongoose.Types.ObjectId(userId),
        { $push: { myPpts: data } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  getUserPPTs: async (req, res, next) => {
    try {
      const { userId } = req.params;
      if (!userId) {
        throw createError.BadRequest("Invalid Parameters");
      }
      const result = await Users.findOne(
        { _id: mongoose.Types.ObjectId(userId) },
        "myPpts"
      )
        .lean()
        .exec();
      if (!result) {
        throw createError.NotFound("PPTs Not Found");
      }
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  addSlideToPPT: async (req, res, next) => {
    try {
      const { userId, pptId } = req.params;
      const slideData = req.body;
      if (!userId || !pptId || !slideData) {
        throw createError.BadRequest("Invalid Parameters");
      }
      const result = await Users.findOneAndUpdate(
        {
          _id: mongoose.Types.ObjectId(userId),
          "myPpts._id": mongoose.Types.ObjectId(pptId),
        },
        { $push: { "myPpts.$.slides": slideData } },
        { new: true, setDefaultsOnInsert: true }
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  getAllUsers: async (req, res, next) => {
    try {
      const { keys } = req.query;
      const query = Users.find();
      if (keys) {
        const selKeysArr = keys.split(",");
        query.select(selKeysArr);
      }
      const result = await query.lean().exec();
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  allUsers: async (req, res, next) => {
    try {
      const { key } = req.query;
      let query;
      if (key === "0" || key === "1") {
        query = Users.find()
          .select("_id firstName lastName email adminConfirm emailConfirm")
          .where({ adminConfirm: parseInt(key) });
      } else {
        query = Users.find().select(
          "_id firstName lastName email adminConfirm emailConfirm"
        );
      }
      const result = await query.lean().exec();
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  adminConfirm: async (req, res, next) => {
    try {
      const { key } = req.query;
      const { ids } = req.body;
      if (!ids || !Array.isArray(ids)) {
        throw createError.BadRequest("Invalid Parameters");
      }
      const update =
        key === "1"
          ? { adminConfirm: 1, emailConfirm: 1 }
          : { adminConfirm: 0 };
      const result = await Users.updateMany(
        { _id: { $in: ids.map((id) => mongoose.Types.ObjectId(id)) } },
        update,
        { upsert: true }
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  mySelfServiceReports: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const data = req.body;
      if (!userId || !data) {
        throw createError.BadRequest("Invalid Parameters");
      }
      const result = await Users.findByIdAndUpdate(
        mongoose.Types.ObjectId(userId),
        { $push: { mySelfServiceReports: data } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  getUserSelfServiceReports: async (req, res, next) => {
    try {
      const { userId } = req.params;
      if (!userId) {
        throw createError.BadRequest("Invalid Parameters");
      }
      const result = await Users.findOne(
        { _id: mongoose.Types.ObjectId(userId) },
        "mySelfServiceReports"
      )
        .lean()
        .exec();
      if (!result) {
        throw createError.NotFound("Self Service Reports Not Found");
      }
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  getSelfReportData: async (req, res, next) => {
    try {
      const { userId, id } = req.params;
      if (!userId || !id) {
        throw createError.BadRequest("Invalid Parameters");
      }
      const result = await Users.findOne(
        { "mySelfServiceReports._id": mongoose.Types.ObjectId(id) },
        "mySelfServiceReports"
      )
        .lean()
        .exec({ virtuals: true });
      if (!result) {
        throw createError.NotFound("Self Service Report Not Found");
      }
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  updateSelfReportData: async (req, res, next) => {
    try {
      const { userId, ssrId } = req.params;
      const { data } = req.body;
      if (!userId || !ssrId || !data) {
        throw createError.BadRequest("Invalid Parameters");
      }
      const result = await Users.updateOne(
        {
          _id: mongoose.Types.ObjectId(userId),
          "mySelfServiceReports._id": mongoose.Types.ObjectId(ssrId),
        },
        { $set: { "mySelfServiceReports.$.selfServiceData": data } },
        { new: true, setDefaultsOnInsert: true }
      );
      if (!result.nModified) {
        throw createError.NotFound("Self Service Report Not Found for Update");
      }
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  assignReports: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { reportIds, featuredReportIds } = req.body;
      if (!userId || !reportIds || !featuredReportIds) {
        throw createError.BadRequest("Invalid Parameters");
      }
      const result = await Users.updateOne(
        { _id: mongoose.Types.ObjectId(userId) },
        {
          $set: {
            reportIds,
            featuredReportIds,
          },
        },
        { upsert: true, new: true }
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  deleteSelfServiceReport: async (req, res, next) => {
    try {
      const { userId, ssrId } = req.params;
      if (!userId || !ssrId) {
        throw createError.BadRequest("Invalid Parameters");
      }
      const result = await Users.updateOne(
        { _id: mongoose.Types.ObjectId(userId) },
        {
          $pull: {
            mySelfServiceReports: {
              _id: mongoose.Types.ObjectId(ssrId),
            },
          },
        }
      );
      if (!result.nModified) {
        throw createError.NotFound(
          "Self Service Report Not Found for Deletion"
        );
      }
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
