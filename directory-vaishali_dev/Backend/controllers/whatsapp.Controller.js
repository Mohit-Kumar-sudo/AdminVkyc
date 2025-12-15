const Whatsapp = require("../models/whatsapp.model");

module.exports = {
 create: async (req, res) => {
  try {
    const { sNo, name, number } = req.body;  // <-- get all fields

    // validation
    if (!sNo || !name || !number) {
      return res.status(400).json({
        success: false,
        message: "sNo, name and number are required"
      });
    }

    // check duplicate number
    const exists = await Whatsapp.findOne({ number });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Number already exists"
      });
    }

    // save
    const saved = await Whatsapp.create({ sNo, name, number });

    res.status(201).json({
      success: true,
      message: "Saved successfully",
      data: saved
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

};
