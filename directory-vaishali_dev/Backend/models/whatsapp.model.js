const mongoose = require("mongoose");

const whatsappSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true
  },
  name:{
    type: String,
  },
  sNo: { type: Number},
});

module.exports = mongoose.model("WhatsappNumbers", whatsappSchema);
