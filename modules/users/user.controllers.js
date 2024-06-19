import HTTPStatus from 'http-status';
import utilities from '../../utilities/utils';
import userModel from './user.model';
import userService from './user.service';
import nodeMailerSerivce from '../../services/nodemailer.service';

export async function signUp(req, res) {
  try {
    const user = await userService.signUp(req.body);
    if (user.hasOwnProperty("errors")) {
      const errObj = utilities.getErrorDetails(user.errors);
      return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
    } else {
      // await nodeMailerSerivce.sendVerifyMail(user, req, res);
      return utilities.sendResponse(HTTPStatus.OK, {message: "Ask admin to approve your account."}, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
  }
}

export async function addDashboard(req, res) {
  try {
    const data = await userService.addDashboard(req.body, req.user._id);
    if (data.hasOwnProperty("errors")) {
      let errObj = utilities.getErrorDetails(data.errors);
      return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
    } else {
      return utilities.sendResponse(HTTPStatus.OK, data, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
  }
}


export async function storeUserPPT(req, res) {
  try {
    const data = await userService.storeUserPPT(req.body, req.user._id);
    if (data.hasOwnProperty("errors")) {
      let errObj = utilities.getErrorDetails(data.errors);
      return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
    } else {
      return utilities.sendResponse(HTTPStatus.OK, data, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
  }
}

export async function getUserPPTs(req, res) {
  try {
    const data = await userService.getUserPPTs(req.user._id);
    if (data.hasOwnProperty("errors")) {
      let errObj = utilities.getErrorDetails(data.errors);
      return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
    } else {
      return utilities.sendResponse(HTTPStatus.OK, data, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
  }
}

export async function getUserDashboards(req, res) {
  try {
    const data = await userService.getUserDashboards(req.user._id, req.query.dashboardId ? req.query.dashboardId : '');
    if (data.hasOwnProperty("errors")) {
      let errObj = utilities.getErrorDetails(data.errors);
      return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
    } else {
      return utilities.sendResponse(HTTPStatus.OK, data, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
  }
}

export async function deleteUserDashboard(req, res) {
  try {
    console.log('req.params', req)
    const data = await userService.deleteUserDashboards(req.user._id, req.params.dashboardId);
    if (data.hasOwnProperty("errors")) {
      let errObj = utilities.getErrorDetails(data.errors);
      return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
    } else {
      return utilities.sendResponse(HTTPStatus.OK, data, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
  }
}
export async function addSlideToPpt(req, res) {
  try {
    const data = await userService.addSlideToPPT(req.user._id, req.params.pptId, req.body);
    if (data.hasOwnProperty("errors")) {
      let errObj = utilities.getErrorDetails(data.errors);
      return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
    } else {
      return utilities.sendResponse(HTTPStatus.OK, data, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
  }
}

export function login(req, res, next) {
  if (!req.user.emailConfirm) {
    nodeMailerSerivce.sendVerifyMail(req.user, req, res);
    return utilities.sendResponse(HTTPStatus.OK, {data: "Please verify your email address first."}, res);
  } else if (!req.user.adminConfirm && req.user.emailConfirm) {
    return utilities.sendResponse(HTTPStatus.OK, {data: "Your profile is awaiting for administrator approval."}, res);
  } else if (req.user.adminConfirm && req.user.emailConfirm) {
    return utilities.sendResponse(HTTPStatus.OK, req.user.onSuccess(), res);
  }
  return next();
}

export async function emailConfirm(req, res) {
  try {
    const data = await userService.emailConfirm(req.params.loginId);

    if (data.hasOwnProperty("errors")) {
      let errObj = utilities.getErrorDetails(data.errors);
      return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
    } else {
      return utilities.sendResponse(HTTPStatus.OK, data, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
  }
}

export async function getEmailConfirm(req, res) {
  try {
    const data = await userService.getEmailConfirm(req.params.loginId);
    if (data.hasOwnProperty("errors")) {
      let errObj = utilities.getErrorDetails(data.errors);
      return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
    } else {
      return utilities.sendResponse(HTTPStatus.OK, data, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
  }
}

export async function allUsers(req, res) {
  try {
    const data = await userService.allUsers(req.params.key);
    if (data.hasOwnProperty("errors")) {
      let errObj = utilities.getErrorDetails(data.errors);
      return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
    } else {
      return utilities.sendResponse(HTTPStatus.OK, data, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
  }
}

export async function adminConfirm(req, res) {
  try {
    const {key, ids} = req.body
    const data = await userService.adminConfirm(key, ids);
    if (data.hasOwnProperty("errors")) {
      let errObj = utilities.getErrorDetails(data.errors);
      return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
    } else {
      return utilities.sendResponse(HTTPStatus.OK, data, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
  }
}

export async function mySelfServiceReports(req, res) {
  try {
    const data = await userService.mySelfServiceReports(req.body, req.user._id);
    if (data.hasOwnProperty("errors")) {
      let errObj = utilities.getErrorDetails(data.errors);
      return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
    } else {
      return utilities.sendResponse(HTTPStatus.OK, data, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
  }
}

export async function getUserSelfServiceReports(req, res) {
  try {
    const data = await userService.getUserSelfServiceReports(req.user._id);
    if (data.hasOwnProperty("errors")) {
      let errObj = utilities.getErrorDetails(data.errors);
      return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
    } else {
      return utilities.sendResponse(HTTPStatus.OK, data, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
  }
}

export async function getSelfReportData(req, res) {
  try {
    const data = await userService.getSelfReportData(req.user._id, req.params.id);
    if (data.hasOwnProperty("errors")) {
      let errObj = utilities.getErrorDetails(data.errors);
      return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
    } else {
      return utilities.sendResponse(HTTPStatus.OK, data, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
  }
}

export async function updateSelfReportData(req, res) {
  try {
    const data = await userService.updateSelfReportData(req.user._id, req.params.id, req.body);
    if (data.hasOwnProperty("errors")) {
      let errObj = utilities.getErrorDetails(data.errors);
      return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
    } else {
      return utilities.sendResponse(HTTPStatus.OK, data, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
  }
}

export async function saveYtUserDetails(req, res) {
  try {
    const {title, link} = req.query;
    if (title) {
      res.json({title, link});
    }
  } catch (error) {
    return res.status(HTTPStatus.BAD_REQUEST).send(err);
  }
}

export async function saveNewsUserDetails(req, res) {
  try {
    const {title, link} = req.query;
    if (title && link) {
      res.json({title, link});
    }
  } catch (error) {
    return res.status(HTTPStatus.BAD_REQUEST).send(err);
  }
}

export async function deleteSelfServiceReport(req, res) {
  try {
    const data = await userService.deleteSelfServiceReport(req.user._id, req.params.ssrId);
    if (data.hasOwnProperty("errors")) {
      let errObj = utilities.getErrorDetails(data.errors);
      return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
    } else {
      return utilities.sendResponse(HTTPStatus.OK, data, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
  }
}

export async function getAllUsers(req, res) {
  try {
    const data = await userModel.getAllUsers(req.query.keys);
    if (data.hasOwnProperty("errors")) {
      return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, utilities.getErrorDetails(data.errors), res);
    } else {
      return utilities.sendResponse(HTTPStatus.OK, data, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
  }
}

export async function assignReports(req, res) {
  try {
    console.log(req.body)
    const data = await userModel.assignReports(req.params.userId, req.body);
    if (data.hasOwnProperty("errors")) {
      return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, utilities.getErrorDetails(data.errors), res);
    } else {
      return utilities.sendResponse(HTTPStatus.OK, data, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
  }
}
