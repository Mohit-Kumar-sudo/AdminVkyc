import HTTPStatus from 'http-status';
import utilities from '../../utilities/utils';
import websiteModel from './website.model';
import userModel from './../users/user.model';
import reportModel from './../reports/report.model';

export async function assignFeaturedReports(req, res) {
  try {
    const data = await websiteModel.assignFeaturedReports(req.body.reportIds);
    if (data.hasOwnProperty("errors")) {
      return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, utilities.getErrorDetails(data.errors), res);
    } else {
      return utilities.sendResponse(HTTPStatus.OK, data, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
  }
}

export async function getFeaturedReports(req, res) {
  try {
    let reportIds = [];
    const user = req.user;
    if(user && user.featuredReportIds && user.featuredReportIds.length) {
      const data = await userModel.getUserFeaturedReports(req.user);
      reportIds = data.featuredReportIds;
    } else {
      const data = await websiteModel.getFeaturedReports(req.user);
      reportIds = data.data.reportIds;
    }
    let reports = [];
    if(reportIds && reportIds.length)
      reports = await reportModel.getReportsByKeys('_id,title,me.start_year,me.end_year,vertical', reportIds)
    if (reports.hasOwnProperty("errors")) {
      return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, utilities.getErrorDetails(reports.errors), res);
    } else {
      return utilities.sendResponse(HTTPStatus.OK, reports, res);
    }
  } catch (er) {
    console.log(er);
    return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
  }
}
