const Reports = require('../Models/Reports.Model')
const mongoose = require("mongoose");
const utilities = require('../utilities/utils')
const _ = require('lodash');

module.exports = {
  fetchReport : async (reportId,reportName = "",vertical, selectKeys, companyId, user) => {
    let query = [];
    if (reportId && vertical == null && !selectKeys) {
      query = Reports.find();
      if (
        user &&
        user.strictlyAllowedReportTypes &&
        user.strictlyAllowedReportTypes.length
      ) {
        query.where({ vertical: { $in: user.strictlyAllowedReportTypes } });
      }
      if (reportId) {
        query.where({ _id: new mongoose.Types.ObjectId(reportId) });
        query.select(
          "me.start_year me.end_year me.base_year overlaps youtubeContents"
        );
      } else if (reportName) {
        query.where({
          searching_title: {
            $regex: new RegExp(reportName, "i")
          },
          approved: true
        });
      }
  
      if (user && user.reportIds && user.reportIds.length) {
        query.where({ _id: { $in: user.reportIds } });
      }
  
      if (vertical) {
        query.where({ vertical: vertical });
      }
      query.where({ approved: true });
  
      if (!utilities.isEmpty(selectKeys)) {
        let selKeysArr = [];
        selKeysArr = selectKeys.split(",");
        [
          "title",
          "vertical",
          "category",
          "owner",
          "status",
          "approver",
          "tocList",
          "title_prefix"
        ].forEach(item => {
          selKeysArr.push(item);
        });
        query.select(selKeysArr);
      } else {
        query.select(
          "title vertical category owner status approver tocList title_prefix"
        );
      }
  
      if (!utilities.isEmpty(companyId)) {
        query.where({ "cp.company_id": companyId });
      }
      // query.sort({ "updatedAt": -1 });
      return query.lean().exec({ virtuals: true });
    } else {
      if (
        user &&
        user.strictlyAllowedReportTypes &&
        user.strictlyAllowedReportTypes.length
      ) {
        query.push({
          $match: { vertical: { $in: user.strictlyAllowedReportTypes } }
        });
      }
      if (reportId) {
        query.push({
          $match: { _id: new mongoose.Types.ObjectId(reportId) }
        });
      } else if (reportName) {
        query.push({
          $match: {
            searching_title: {
              $regex: new RegExp(reportName, "i")
            },
            approved: true
          }
        });
      }
      if (user && user.reportIds && user.reportIds.length) {
        query.push({
          $match: { _id: { $in: user.reportIds } }
        });
      }
      if (vertical) {
        query.push({
          $match: { vertical: vertical }
        });
      }
  
      if (!utilities.isEmpty(selectKeys)) {
        let selKeysArr = [];
        selKeysArr = selectKeys.split(",");
        [
          "title",
          "vertical",
          "category",
          "owner",
          "status",
          "approver",
          "tocList",
          "title_prefix"
        ].forEach(item => {
          selKeysArr.push(item);
        });
      }
      if (!utilities.isEmpty(companyId)) {
        query.push({
          $match: { "cp.company_id": companyId }
        });
      }
      const queryPromise = Reports.aggregate(query);
      return queryPromise;
    }
  }
}
