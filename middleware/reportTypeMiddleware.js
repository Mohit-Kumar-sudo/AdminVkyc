const mongoose = require("mongoose");
const reportsModel = require('../Models/Reports.Model')

const authenticateReportType = async (req, res, next) => {
  if (req.params.rid && req.user.allowedReportTypes && req.user.allowedReportTypes.length) {
    const report = await reportsModel.Reports.findOne({_id: mongoose.Types.ObjectId(req.params.rid)}).select('vertical');
    if (!req.user.allowedReportTypes.includes(report.vertical)) {
      return res.status(500).send({message: 'User not allowed to use reports other than Healthcare'});
    }
    next()
  } else {
    next()
  }
};

module.exports = {
  authenticateReportType
};
