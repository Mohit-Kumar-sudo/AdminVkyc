import leadService from "./leads-db.service";
import _, { result } from "lodash";
import utilities from "../../utilities/utils";
import HTTPStatus from "http-status";

export async function addNewLead(req, res) {
  try {
    const lData = req.body;
    const id = null;
    const leadData = (await leadService.addLeads(lData)) || {};
    if (!utilities.isEmpty(leadData.errors)) {
      const errObj = leadData.errors;
      return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
    } else {
      return utilities.sendResponse(HTTPStatus.OK, leadData, res);
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

export async function getLeads(req, res) {
  try {
    const leadData = (await leadService.getLeads(req, res)) || {};
    if (!utilities.isEmpty(leadData.errors)) {
      const errObj = leadData.errors;
      // const errObj = utilities.getErrorDetails(report.errors);
      return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
    } else {
      return utilities.sendResponse(HTTPStatus.OK, leadData, res);
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

export async function addLeadsData(req, res) {
  try {
    const id = req.params["company_id"];
    const data = req.body;
    const leadData = (await leadService.addLeadsData(data, id)) || {};
    if (!utilities.isEmpty(leadData.errors)) {
      const errObj = leadData.errors;
      return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
    } else {
      return utilities.sendResponse(HTTPStatus.OK, leadData, res);
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

export async function getLeadsById(req, res) {
  try {
    const id = req.params["company_id"];
    const leadData = (await leadService.getLeadsById(id)) || {};
    if (!utilities.isEmpty(leadData.errors)) {
      const errObj = leadData.errors;
      return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
    } else {
      return utilities.sendResponse(HTTPStatus.OK, leadData, res);
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

export async function searchByName(req, res) {
  try {
    const data = req.body;
    const leadData = (await leadService.searchByName(data)) || {};

    if (!utilities.isEmpty(leadData.errors)) {
      const errObj = leadData.errors;
      return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
    } else {
      return utilities.sendResponse(HTTPStatus.OK, leadData, res);
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

export async function searchByCompany(req, res) {
  try {
    const data = req.body;
    const leadData = (await leadService.searchByName(data)) || {};

    if (!utilities.isEmpty(leadData.errors)) {
      const errObj = leadData.errors;
      return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
    } else {
      return utilities.sendResponse(HTTPStatus.OK, leadData, res);
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

