import mongoose, { Schema } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
import validator from "validator";
import { compareSync, hashSync } from "bcrypt-nodejs";
import jwt from "jsonwebtoken";

import { passwordReg } from "./user.validations";
import constants from "../../config/constants";
import utilities from "../../utilities/utils";

const UserSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: [true, "Email is required"],
      trim: true,
      validate: {
        validator(email) {
          return validator.isEmail(email);
        },
        message: "{VALUE} is not a valid email"
      }
    },
    firstName: {
      type: String,
      required: [true, "FirstName is required"],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, "LastName is required"],
      trim: true
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      trim: true,
      minlength: [6, "Password should have more that 6 characters"],
      validate: {
        validator(password) {
          return passwordReg.test(password);
        },
        message: "{VALUE} is not a valid password"
      }
    },
    emailConfirm: {
      type: Number,
      default: 0
    },
    adminConfirm: {
      type: Number,
      default: 0
    },
    pptExport: {
      type: Schema.Types.Boolean,
      default: false
    },
    imageExport: {
      type: Schema.Types.Boolean,
      default: false
    },
    pdfExport: {
      type: Schema.Types.Boolean,
      default: false
    },
    excelExport: {
      type: Schema.Types.Boolean,
      default: false
    },
    wordOpen: {
      type: Schema.Types.Boolean,
      default: false
    },
    pdfOpen: {
      type: Schema.Types.Boolean,
      default: false
    },
    excelOpen: {
      type: Schema.Types.Boolean,
      default: false
    },
    leadDBOpen: {
      type: Schema.Types.Boolean,
      default: false
    },
    createPpt: {
      type: Schema.Types.Boolean,
      default: false
    },
    sendWhatsApp: {
      type: Schema.Types.Boolean,
      default: false
    },
    allowedReportTypes: [
      {
        type: Schema.Types.String
      }
    ],
    strictlyAllowedReportTypes: [
      {
        type: Schema.Types.String
      }
    ],
    myPpts: [
      {
        title: { type: Schema.Types.String },
        reportId: {
          type: Schema.Types.ObjectId,
          ref: "reports",
          trim: true,
          required: true
        },
        slides: [{ type: Schema.Types.Mixed }]
      }
    ],
    myDashboards: [
      {
        title: { type: Schema.Types.String },
        panels: [
          {
            reportId: {
              type: Schema.Types.ObjectId,
              ref: "reports",
              trim: true,
              required: true
            },
            data: { type: Schema.Types.Mixed }
          }
        ]
      }
    ],
    mySelfServiceReports: [
      {
        title: { type: Schema.Types.String },
        selfServiceData: { type: Schema.Types.Mixed }
      }
    ],
    settings: [
      {
        title: Schema.Types.String,
        data: { type: Schema.Types.Mixed }
      }
    ],
    points: {
      type: Schema.Types.Number
    },
    pointsHistory: [{ pastPoints: Schema.Types.Number }, { timestamps: true }],
    reportIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "reports",
        trim: true,
        required: true
      }
    ],
    featuredReportIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "reports",
        trim: true,
        required: true
      }
    ]
  },
  {
    timestamps: true
  }
);

UserSchema.plugin(uniqueValidator, {
  message: "{VALUE} is aleady taken"
});

UserSchema.pre("save", function(next) {
  if (this.isModified("password")) {
    this.password = this._hashPassword(this.password);
    return next();
  }
  return next();
});

UserSchema.methods = {
  _hashPassword(password) {
    return hashSync(password);
  },
  authenticateUser(password) {
    return compareSync(password, this.password);
  },
  createToken() {
    return jwt.sign(
      {
        id: this._id,
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        pptExport: this.pptExport,
        imageExport: this.imageExport,
        pdfExport: this.pdfExport,
        excelExport: this.excelExport,
        createPpt: this.createPpt,
        sendWhatsApp: this.sendWhatsApp,
        wordOpen: this.wordOpen,
        pdfOpen: this.pdfOpen,
        excelOpen: this.excelOpen,
        leadDBOpen: this.leadDBOpen
      },
      constants.JWT_SECRET
    );
  },
  toAuthJSON() {
    return {
      id: this._id,
      token: `JWT ${this.createToken()}`
    };
  },
  toJSON() {
    return {
      id: this._id
    };
  },
  onSuccess() {
    return {
      id: this._id,
      email: this.email,
      name: `${this.firstName} ${this.lastName}`,
      token: `JWT ${this.createToken()}`
    };
  }
};

const Users = mongoose.model("User", UserSchema);

const signUp = async function(userDetails) {
  const userObj = new Users(userDetails);
  await userObj.save();
  return userObj.onSuccess();
};

const emailConfirm = async function(loginId) {
  return await Users.updateOne(
    { _id: mongoose.Types.ObjectId(loginId) },
    { emailConfirm: 1 },
    { upsert: true }
  );
};

const getEmailConfirm = async function(loginId) {
  const query = Users.findOne(
    { _id: mongoose.Types.ObjectId(loginId) },
    "emailConfirm"
  );
  return query.lean().exec({ virtuals: true });
};

const getUserFeaturedReports = user => {
  const query = Users.findOne(
    { _id: mongoose.Types.ObjectId(user._id) },
    "featuredReportIds"
  );
  return query.lean().exec({ virtuals: true });
};

const addDashboard = async function(data, userId) {
  return await Users.update(
    { _id: mongoose.Types.ObjectId(userId) },
    { $push: { myDashboards: data } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
};

const getUserDashboards = async function(userId, dashboardId) {
  let query;
  if (dashboardId) {
    query = Users.findOne(
      {
        _id: mongoose.Types.ObjectId(userId),
        "myDashboards._id": mongoose.Types.ObjectId(dashboardId)
      },
      { "myDashboards.$": 1, title: 1 }
    );
  } else {
    query = Users.findOne(
      { _id: mongoose.Types.ObjectId(userId) },
      "myDashboards"
    );
  }
  return query.lean().exec({ virtuals: true });
};

const deleteUserDashboard = async (userId, dashboardId) => {
  return Users.update(
    { _id: mongoose.Types.ObjectId(userId) },
    {
      $pull: {
        myDashboards: {
          _id: mongoose.Types.ObjectId(dashboardId)
        }
      }
    }
  );
};

const storeUserPPT = async function(data, userId) {
  return await Users.update(
    { _id: mongoose.Types.ObjectId(userId) },
    { $push: { myPpts: data } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
};

const getUserPPTs = async function(userId) {
  const query = Users.findOne(
    { _id: mongoose.Types.ObjectId(userId) },
    "myPpts"
  );
  return query.lean().exec({ virtuals: true });
};

const addSlideToPPT = async (userId, pptId, slideData) => {
  return Users.update(
    {
      _id: mongoose.Types.ObjectId(userId),
      "myPpts._id": mongoose.Types.ObjectId(pptId)
    },
    {
      $push: { "myPpts.$.slides": slideData }
    },
    { new: true, setDefaultsOnInsert: true }
  );
};

const getAllUsers = async function(keys = null) {
  const query = Users.find();
  if (!utilities.isEmpty(keys)) {
    const selKeysArr = keys.split(",");
    query.select(selKeysArr);
  }
  return query.lean().exec({ virtuals: true });
};

const allUsers = async function(key) {
  let query;
  if (key == 0 || key == 1)
    query = Users.find()
      .select("_id firstName lastName email adminConfirm emailConfirm")
      .where({ adminConfirm: key });
  else
    query = Users.find().select(
      "_id firstName lastName email adminConfirm emailConfirm"
    );

  return query.lean().exec({ virtuals: true });
};

const adminConfirm = async function(key, ids) {
  if (key == 1) {
    return await Users.updateMany(
      { _id: { $in: ids } },
      { adminConfirm: 1, emailConfirm: 1 },
      {
        upsert: true,
        multi: true
      }
    );
  } else if (key == 0) {
    return await Users.updateMany(
      { _id: { $in: ids } },
      { adminConfirm: 0 },
      { upsert: true, multi: true }
    );
  }
};

const mySelfServiceReports = async function(data, userId) {
  return await Users.update(
    { _id: mongoose.Types.ObjectId(userId) },
    { $push: { mySelfServiceReports: data } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
};

const getUserSelfServiceReports = async function(userId) {
  const query = Users.findOne(
    { _id: mongoose.Types.ObjectId(userId) },
    "mySelfServiceReports"
  );
  return query.lean().exec({ virtuals: true });
};

const getSelfReportData = async function(userId, id) {
  return await Users.findOne(
    { "mySelfServiceReports._id": mongoose.Types.ObjectId(id) },
    "mySelfServiceReports"
  )
    .lean()
    .exec({ virtuals: true });
};

const updateSelfReportData = async (userId, ssrId, data) => {
  return Users.update(
    {
      _id: mongoose.Types.ObjectId(userId),
      "mySelfServiceReports._id": mongoose.Types.ObjectId(ssrId)
    },
    { "mySelfServiceReports.$.selfServiceData": data },
    { new: true, setDefaultsOnInsert: true }
  );
};

const assignReports = async (userId, body) => {
  return Users.update(
    { _id: mongoose.Types.ObjectId(userId) },
    {
      $set: {
        reportIds: body.reportIds,
        featuredReportIds: body.featuredReportIds
      }
    },
    { upsert: true, new: true }
  );
};

const deleteSelfServiceReport = async (userId, ssrId) => {
  return Users.update(
    { _id: mongoose.Types.ObjectId(userId) },
    {
      $pull: {
        mySelfServiceReports: {
          _id: mongoose.Types.ObjectId(ssrId)
        }
      }
    }
  );
};
// Exporting model to external world
module.exports = {
  signUp,
  storeUserPPT,
  getUserPPTs,
  addSlideToPPT,
  addDashboard,
  getUserDashboards,
  deleteUserDashboard,
  emailConfirm,
  getEmailConfirm,
  allUsers,
  adminConfirm,
  mySelfServiceReports,
  getUserSelfServiceReports,
  getSelfReportData,
  updateSelfReportData,
  deleteSelfServiceReport,
  Users,
  assignReports,
  getAllUsers,
  getUserFeaturedReports
};
