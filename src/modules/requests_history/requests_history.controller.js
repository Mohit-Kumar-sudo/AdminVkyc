// import HTTPStatus from 'http-status';
// import utilities from '../../../utilities/utils';
// // import reportModel from '../../reports/report.model';
// import RequestsHistory from'../../../src/modules/requests_history/requests_history.model'

// module.exports.apiResponselogger = function (originalUrl,route,reportId, userId, timestamps) {

//     var values = {
//       originalUrl: originalUrl ,
//       route: route,
//       reportId: reportId,
//       userId: userId ,
//       timestamps: timestamps

//     };

//     dataaccess.Create(values)
//         .then(function (result) {
//           console.log("result",result);
//             console.log(JSON.stringify(result));
//         }, function (err) {
//   console.log(err);
//             console.log('Error: ' + JSON.stringify(err));
//         });
//   }

import HTTPStatus from "http-status";
import utilities from "../../utilities/utils";
import csv from "csv-parser";
import fs from "fs";
import multer from "multer";
import path from "path";
import _ from "lodash";
const reqHistoryService = require("./requests_history.service");

// Add Data API controllers

export async function RequestsHistory(req, res) {
  try {
    console.log("req.body",req.body);
    const historyData = req.body;
    console.log("historyData", historyData);
    const userId = (req.user && req.user.id) || null;
    return
    const APIData =
      (await reqHistoryService.RequestsHistory(historyData, userId)) || {};
    if (!utilities.isEmpty(APIData.errors)) {
      const errObj = APIData.errors;
      // const errObj = utilities.getErrorDetails(report.errors);
      utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
    } else {
      utilities.sendResponse(HTTPStatus.OK, APIData, res);
    }
  } catch (er) {
    utilities.sendErrorResponse(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      true,
      er,
      res
    );
  }
}

export async function getHistoryReportById(req, res) {
  try {
    const id = req.params["User_id"];
    console.log("user_id", id);
    const HistoryData =
      (await reqHistoryService.getHistoryReportById(id)) || {};
    if (!utilities.isEmpty(HistoryData.errors)) {
      const errObj = HistoryData.errors;
      utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
    } else {
      utilities.sendResponse(HTTPStatus.OK, HistoryData, res);
    }
  } catch (er) {
    utilities.sendErrorResponse(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      true,
      er,
      res
    );
  }
}
