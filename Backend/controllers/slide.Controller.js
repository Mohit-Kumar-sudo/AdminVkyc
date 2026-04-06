const Model = require('../models/slide.model');

module.exports = {

  create: async (req, res) => {
    try {
      const { title, isActive } = req.body;
      const image = req.file ? req.file.path : null;

      const slide = await Model.create({
        title,
        image,
        isActive
      });

      return res.status(201).json({
        success: true,
        message: "Slide created successfully",
        data: slide
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },


  get: async (req, res) => {
    try {
      const slides = await Model.find().sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: slides
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },


  delete: async (req, res) => {
    try {
      const slide = await Model.findByIdAndDelete(req.params.id);
      
      if (!slide) {
        return res.status(404).json({
          success: false,
          message: "Slide not found"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Slide deleted successfully"
      });

    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

};
