import HTTPStatus from "http-status";
import utilities from "../../utilities/utils";
import _ from "lodash";
const reqHistoryService = require("./requests_history.service");

// Add Data API controllers

export async function RequestsHistory(req, res) {
  try {
    const historyData = req.body;
    const userId = (req.user && req.user.id) || null;
    const APIData =
      (await reqHistoryService.RequestsHistory(historyData, userId)) || {};
    if (!utilities.isEmpty(APIData.errors)) {
      const errObj = APIData.errors;
      // const errObj = utilities.getErrorDetails(report.errors);
      return utilities.sendErrorResponse(
        HTTPStatus.BAD_REQUEST,
        true,
        errObj,
        res
      );
    } else {
      return utilities.sendResponse(HTTPStatus.OK, APIData, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(
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
    const userId = (req.user && req.user.id) || null;
    const HistoryData =
      (await reqHistoryService.getHistoryReportById(id)) || {};
    if (!utilities.isEmpty(HistoryData.errors)) {
      const errObj = HistoryData.errors;
      return utilities.sendErrorResponse(
        HTTPStatus.BAD_REQUEST,
        true,
        errObj,
        res
      );
    } else {
      return utilities.sendResponse(HTTPStatus.OK, HistoryData, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      true,
      er,
      res
    );
  }
}
