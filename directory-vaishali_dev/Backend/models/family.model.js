const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  name: String,
  relation: String,
  DOB: String,
  education: String,
  occupation: String,
  merrital_status: String,
  blood_group: String,
  mobile: String,
  is_inactive: { type: Boolean, default: false },
  image: {
    type: String,
    required: false
  },

});

const FamilyMemberSchema = new mongoose.Schema({
  sNo: Number,
  leaderName: String,
  members: [memberSchema],
}, { timestamps: true });


module.exports = mongoose.model("FamilyMembers", FamilyMemberSchema);