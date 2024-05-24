import HTTPStatus from 'http-status';
import utilities from '../../utilities/utils';

const tocService = require('./toc.service');
const reportModel = require('../reports/report.model');

export async function getTOCByMainSection(req, res) {
  try {
    const reportId = req.params.rid;
    const mainSectionId = req.query.msid;
    const tocData = await tocService.getTOCByMainSection(reportId, mainSectionId);
    if (!utilities.isEmpty(tocData.errors)) {
      const errObj = tocData.errors;
      return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, errObj, res);
    } else {
      return utilities.sendResponse(HTTPStatus.OK, tocData, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
  }
}

export async function addContent(req, res) {
    try {
        const reportId = req.params['rid'];
        const tocDetails = req.body;

        const sectionDetails = {};
        sectionDetails.sectionId = req.query['sid'];
        sectionDetails.sectionPid = req.query['spid'] || "";
        sectionDetails.mainSectionId = parseInt(req.query['msid']) || "";
        sectionDetails.sectionKey = req.query['sectionKey'] || "";

        tocDetails.main_section_id = parseInt(req.body.main_section_id) || sectionDetails.mainSectionId;

        const tocData = await tocService.addContent(tocDetails, reportId, sectionDetails) || {};
        if (!utilities.isEmpty(tocData.errors)) {
            const errObj = tocData.errors;
            // const errObj = utilities.getErrorDetails(report.errors);
            return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, errObj, res);
        } else {
            return utilities.sendResponse(HTTPStatus.OK, tocData, res);
        }

    } catch (er) {
        return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}

export async function replaceContent(req, res) {
    try {
        const reportId = req.params['rid'];
        const tocDetails = req.body;

        const sectionDetails = {};
        sectionDetails.sectionId = req.query['sid'];
        sectionDetails.sectionPid = req.query['spid'] || "";
        sectionDetails.mainSectionId = parseInt(req.query['msid']) || "";
        sectionDetails.sectionKey = req.query['sectionKey'] || "";

        tocDetails.main_section_id = parseInt(req.body.main_section_id) || sectionDetails.mainSectionId;

        const tocData = await tocService.replaceContent(tocDetails, reportId, sectionDetails) || {};
        if (!utilities.isEmpty(tocData.errors)) {
            const errObj = tocData.errors;
            // const errObj = utilities.getErrorDetails(report.errors);
            return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, errObj, res);
        } else {
            return utilities.sendResponse(HTTPStatus.OK, tocData, res);
        }

    } catch (er) {
        return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}

export async function getContent(req, res) {
    try {
        const reportId = req.params['rid'];
        const sectionId = req.query['sid'];
        const sectionPid = req.query['spid'] || "";
        const mainSectionId = parseInt(req.query['msid'] || "");
        let tocData = {};

        tocData = await tocService.getContent(reportId, sectionId, mainSectionId, sectionPid) || {};

        if (!utilities.isEmpty(tocData.errors)) {
            const errObj = tocData.errors;
            // const errObj = utilities.getErrorDetails(report.errors);
            return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
        } else {
            return utilities.sendResponse(HTTPStatus.OK, tocData, res);
        }

    } catch (er) {
        console.error("Exception in retrieving report content data: "  + er.message);
        return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}

export async function getContentByMetaKey(req, res) {
    try {
        const reportId = req.params['rid'];
        const metaSectionKey = req.query['meta_key'];
        const tocData = await reportModel.getContentByKey(reportId, metaSectionKey) || {};
        if (!utilities.isEmpty(tocData.errors)) {
            const errObj = tocData.errors;
            // const errObj = utilities.getErrorDetails(report.errors);
            return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
        } else {
            return utilities.sendResponse(HTTPStatus.OK, tocData, res);
        }

    } catch (er) {
        console.error("Exception in retrieving report content data: "  + er.message);
        return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}

export async function getContentByMetaName(req, res) {
    try {
        const reportId = req.params['rid'];
        const metaSectionName = req.query['meta_value'];
        const tocData = await reportModel.getContentByName(reportId, metaSectionName) || {};
        if (!utilities.isEmpty(tocData.errors)) {
            const errObj = tocData.errors;
            // const errObj = utilities.getErrorDetails(report.errors);
            return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
        } else {
            return utilities.sendResponse(HTTPStatus.OK, tocData, res);
        }

    } catch (er) {
        console.error(`Exception in retrieving report content data: ${   er.message}`);
        return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}

export async function getContentBySectionName(req, res) {
    try {
        const reportId = req.params['rid'];
        const sectionName = req.query['section_name'];
        const tocData = await reportModel.getContentBySectionName(reportId, sectionName) || {};
        if (!utilities.isEmpty(tocData.errors)) {
            const errObj = tocData.errors;
            // const errObj = utilities.getErrorDetails(report.errors);
            return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
        } else {
            return utilities.sendResponse(HTTPStatus.OK, tocData, res);
        }

    } catch (er) {
        console.error("Exception in retrieving report content data: "  + er.message);
        return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}

export async function getContentForSectionParent(req, res) {
    try {
        const reportId = req.params['rid'];
        const sectionPid = req.query['spid'] || "";
        const mainSectionId = parseInt(req.query['msid'] || "");
        let tocData = {};

        tocData = await tocService.getContentForSectionParent(reportId, mainSectionId, sectionPid) || {};

        if (!utilities.isEmpty(tocData.errors)) {
            const errObj = tocData.errors;
            // const errObj = utilities.getErrorDetails(report.errors);
            return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
        } else {
            return utilities.sendResponse(HTTPStatus.OK, tocData, res);
        }

    } catch (er) {
        console.error("Exception in retrieving report content data: "  + er.message);
        return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}


export async function getContentByKey(req, res) {
    try {
        const reportId = req.params['rid'];
        const sectionKey = req.query['sectKey'];

        let tocData = {};

        tocData = await tocService.getContentByKey(reportId, sectionKey) || {};

        if (!utilities.isEmpty(tocData.errors)) {
            const errObj = tocData.errors;
            // const errObj = utilities.getErrorDetails(report.errors);
            return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
        } else {
            return utilities.sendResponse(HTTPStatus.OK, tocData, res);
        }

    } catch (er) {
        console.error(`Exception in retrieving content data using sectionKey (${sectionKey}) : ${er.message}`);
        return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}


export async function getAllReportContent(req, res) {
    try {
        const reportId = req.params['rid'];
        let tocData = {};

        tocData = await tocService.getAllReportContent(reportId) || {};

        if (!utilities.isEmpty(tocData.errors)) {
            const errObj = tocData.errors;
            return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
        } else {
            return utilities.sendResponse(HTTPStatus.OK, tocData, res);
        }

    } catch (er) {
        console.error("Exception in retrieving all report content data: "  + er.message);
        return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}
