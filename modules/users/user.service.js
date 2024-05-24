import userModel from './user.model';

async function signUp(userDetails) {
  try {
    return await userModel.signUp({
      ...userDetails,
      pptExport: false,
      imageExport: false,
      pdfExport: false,
      excelExport: false,
      createPpt: false,
      sendWhatsApp: false
    });
  } catch (er) {
    return er;
  }
}

async function storeUserPPT(data, userId) {
  try {
    return await userModel.storeUserPPT(data, userId);
  } catch (er) {
    return er;
  }
}

async function addDashboard(data, userId) {
  try {
    return await userModel.addDashboard(data, userId);
  } catch (er) {
    return er;
  }
}

async function getUserPPTs(userId) {
  try {
    return await userModel.getUserPPTs(userId);
  } catch (er) {
    return er;
  }
}

async function getUserDashboards(userId, dashboardId) {
  try {
    return await userModel.getUserDashboards(userId, dashboardId);
  } catch (er) {
    return er;
  }
}

async function deleteUserDashboards(userId, dashboardId) {
  try {
    return await userModel.deleteUserDashboard(userId, dashboardId);
  } catch (er) {
    return er;
  }
}

async function addSlideToPPT(userId, pptId, slideData) {
  try {
    return await userModel.addSlideToPPT(userId, pptId, slideData);
  } catch (er) {
    return er;
  }
}

async function emailConfirm(loginId) {
  try {
    return await userModel.emailConfirm(loginId);
  } catch (er) {
    return er;
  }
}

async function getEmailConfirm(loginId) {
  try {
    return await userModel.getEmailConfirm(loginId);
  } catch (er) {
    return er;
  }
}

async function allUsers(key) {
  try {
    return await userModel.allUsers(key);
  } catch (er) {
    return er;
  }
}

async function adminConfirm(key, ids) {
  try {
    return await userModel.adminConfirm(key, ids);
  } catch (er) {
    return er;
  }
}

async function mySelfServiceReports(data, userId) {
  try {
    return await userModel.mySelfServiceReports(data, userId);
  } catch (er) {
    return er;
  }
}

async function getUserSelfServiceReports(userId) {
  try {
    return await userModel.getUserSelfServiceReports(userId);
  } catch (er) {
    return er;
  }
}

async function getSelfReportData(userId, id) {
  try {
    return await userModel.getSelfReportData(userId, id);
  } catch (er) {
    return er;
  }
}

async function updateSelfReportData(userId, ssrId, data) {
  try {
    return await userModel.updateSelfReportData(userId, ssrId, data);
  } catch (er) {
    return er;
  }
}

async function deleteSelfServiceReport(userId, ssrId) {
  try {
    return await userModel.deleteSelfServiceReport(userId, ssrId);
  } catch (er) {
    return er;
  }
}

module.exports = {
  signUp,
  storeUserPPT,
  addDashboard,
  getUserDashboards,
  deleteUserDashboards,
  getUserPPTs,
  addSlideToPPT,
  emailConfirm,
  getEmailConfirm,
  adminConfirm,
  allUsers,
  mySelfServiceReports,
  getUserSelfServiceReports,
  getSelfReportData,
  updateSelfReportData,
  deleteSelfServiceReport
};
