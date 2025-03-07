const mongoose = require('mongoose');
const { Schema } = mongoose;

const leadsSchema = new Schema({
  industry_vertical: { type: String },
  company: { type: String, required: true },
  leads: [{
    first_name: { type: String },
    last_name: { type: String },
    email: { type: String },
    designation: { type: String },
    country: { type: String },
    company_name: { type: String },
  }]
});

const leadsModel = mongoose.model('leads', leadsSchema);
module.exports = leadsModel
