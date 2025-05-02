import HTTPStatus from "http-status";
import utilities from "../../utilities/utils";

const reportAccessService = require("./reports_access.service");

export async function getReportsList(req, res) {
  console.log("reqqq",req.user)
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
    }
    return utilities.sendResponse(HTTPStatus.OK, APIData, res);

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
      console.log('dataxxxxx', data)
      let newReports = {
        reportIds:data.reportIds,
        userId:userId
      }
      const APIData =
        (await reportAccessService.addReports(newReports)) || {};
      if (!utilities.isEmpty(APIData.errors)) {
        const errObj = APIData.errors;
        return utilities.sendErrorResponse(
          HTTPStatus.BAD_REQUEST,
          true,
          errObj,
          res
        );
      }
        return utilities.sendResponse(HTTPStatus.OK, APIData, res);

    } catch (er) {
      return utilities.sendErrorResponse(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        true,
        er,
        res
      );
    }
  }

export async function addCharts(req, res) {
    try {
      const data = req.body
      const userId = (req.user && req.user.id) || null;
      let newReports = {
        userId:userId,
        reportIds:data.reportIds,
        charts : data.charts
      }
      const APIData =
        (await reportAccessService.addCharts(newReports)) || {};
      if (!utilities.isEmpty(APIData.errors)) {
        const errObj = APIData.errors;
        return utilities.sendErrorResponse(
          HTTPStatus.BAD_REQUEST,
          true,
          errObj,
          res
        );
      }
        return utilities.sendResponse(HTTPStatus.OK, APIData, res);

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
      const userId = (req.user && req.user.id) || null;
      let newReports = {
        reportIds:data,
        userId:userId
      }
      const APIData =
        (await reportAccessService.updateReports(newReports)) || {};
      if (!utilities.isEmpty(APIData.errors)) {
        const errObj = APIData.errors;
        return utilities.sendErrorResponse(
          HTTPStatus.BAD_REQUEST,
          true,
          errObj,
          res
        );
      }
        return utilities.sendResponse(HTTPStatus.OK, APIData, res);

    } catch (er) {
      return utilities.sendErrorResponse(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        true,
        er,
        res
      );
    }
  }

  export async function updateCharts(req, res) {
    try {
      const data = req.body
      const userId = (req.user && req.user.id) || null;
      let newReports = {
        charts:data.charts,
        userId:userId
      }
      const APIData =
        (await reportAccessService.updateCharts(newReports)) || {};
      if (!utilities.isEmpty(APIData.errors)) {
        const errObj = APIData.errors;
        return utilities.sendErrorResponse(
          HTTPStatus.BAD_REQUEST,
          true,
          errObj,
          res
        );
      }
        return utilities.sendResponse(HTTPStatus.OK, APIData, res);

    } catch (er) {
      return utilities.sendErrorResponse(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        true,
        er,
        res
      );
    }
  }
