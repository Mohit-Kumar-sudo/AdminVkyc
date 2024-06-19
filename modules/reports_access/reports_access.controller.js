import HTTPStatus from "http-status";
import utilities from "../../utilities/utils";

const reportAccessService = require("./reports_access.service");

export async function getReportsList(req, res) {
  try {
    const userId = (req.user && req.user.id) || null;
    const APIData = (await reportAccessService.getReportsList(userId)) || {};
    if (!utilities.isEmpty(APIData.error)) {
      const errObj = APIData.errors;
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

export async function addReports(req, res) {
    try {
      const data = req.body
      const userId = (req.user && req.user.id) || null;
      const APIData =
        (await reportAccessService.addReports(data)) || {};
      if (!utilities.isEmpty(APIData.errors)) {
        const errObj = APIData.errors;
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

  export async function updateReports(req, res) {
    try {
      const data = req.body
      console.log('data=====>', data)
      const APIData =
        (await reportAccessService.updateReports(data)) || {};
      if (!utilities.isEmpty(APIData.errors)) {
        const errObj = APIData.errors;
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