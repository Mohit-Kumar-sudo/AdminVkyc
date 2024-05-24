import mongoose, { Schema, SchemaTypes } from 'mongoose';
import utilities from '../../../utilities/utils';

const PreferencesSchema = new Schema(
  {
    viewKey: { type: Schema.Types.String, required: true },
    prefs: { type: Schema.Types.Mixed, required: true },
    user: {
        type: Schema.Types.ObjectId,
        required: [true, 'user details are required'],
        ref: 'users'
    },
    reportId: {
      type: Schema.Types.ObjectId,
      ref: 'reports'
    }
  },
  {
      timestamps: true,
  }
);

// Ensure virtual fields are serialised.
PreferencesSchema.set('toJSON', { virtuals: true });
PreferencesSchema.set('toObject', { virtuals: true });

const UserPrefs = mongoose.model('user_prefs', PreferencesSchema);


const savePrefsData = async function (prefsData, userId, viewKey, reportId) {
  // var prefsData = null;
  var userPrefsObj = null;
  let prefsSavedData = await getPrefsData(userId, viewKey) || [];

  if (utilities.isEmpty(prefsSavedData)) { // if prefs not present already
    userPrefsObj = new UserPrefs({
      viewKey: viewKey,
      prefs: prefsData,
      user: mongoose.Types.ObjectId(userId),
      reportId: !utilities.isEmpty(reportId) ? mongoose.Types.ObjectId(reportId) : null
    });
    userPrefsObj = await userPrefsObj.save();
    return userPrefsObj._doc;
  } else {  // if prefs found, then override it
    prefsSavedData = prefsSavedData[0];
    userPrefsObj = await UserPrefs.findOneAndUpdate({"_id": mongoose.Types.ObjectId(prefsSavedData._id)}, {
      "$set": {
        "prefs" : prefsData,
        "reportId" : !utilities.isEmpty(reportId) ? mongoose.Types.ObjectId(reportId) : null
      }
    }, {
      "new": true,
      "setDefaultsOnInsert": true,
      "returnOriginal": false,
      "returnNewDocument": false

    });
  }

  return userPrefsObj;
}

// GET user prefs data based upon viewKey
const getPrefsData = async function (userId, viewKey, reportId) {

  var query = UserPrefs.find();
  
  query.where({ 
    "user": mongoose.Types.ObjectId(userId),
    "viewKey": viewKey,  
  });

  if (reportId) {
    query.where({"reportId": mongoose.Types.ObjectId(reportId)});
  } 

  return await (query.lean().exec({"virtuals": true}));
}

// Exporting model to external world
module.exports = {
  savePrefsData,
  getPrefsData
};