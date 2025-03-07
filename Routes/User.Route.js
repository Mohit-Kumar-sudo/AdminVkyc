const express = require('express');
const { verifyAccessToken } = require('../Helpers/jwt_helpers')
const userController = require('../Controllers/User.Controller');

const routes = express.Router();

// User Reports
routes.post('/assign_reports/:userId', verifyAccessToken, userController.assignReports);
routes.get('/get_user_self_reports', verifyAccessToken, userController.getUserSelfServiceReports);
routes.get('/get_user_self_reports/:id', verifyAccessToken, userController.getSelfReportData);
routes.post('/update_user_self_reports/:id', verifyAccessToken, userController.updateSelfReportData);

// User Dashboards
routes.get('/get_user_dashboards', verifyAccessToken, userController.getUserDashboards);
routes.post('/add_dashboard', verifyAccessToken, userController.addDashboard);
routes.delete('/delete_user_dashboards/:dashboardId', verifyAccessToken, userController.deleteUserDashboard);

// PPT Management
routes.post('/store_ppt', verifyAccessToken, userController.storeUserPPT);
routes.post('/add_slide/:pptId', verifyAccessToken, userController.addSlideToPPT);
routes.get('/get_user_ppts', verifyAccessToken, userController.getUserPPTs);

// Authentication
routes.post('/signup', userController.signUp);
routes.post('/login', userController.login);
routes.get('/verify/:loginId', userController.getEmailConfirm);
routes.post('/verify/:loginId', userController.emailConfirm);

// Miscellaneous
routes.get('/all_users/:key', verifyAccessToken, userController.allUsers);
routes.post('/access', verifyAccessToken, userController.adminConfirm);
routes.post('/self_service', verifyAccessToken, userController.mySelfServiceReports);

// User Details
// routes.get('/youtube_video_details', verifyAccessToken, userController.saveYtUserDetails);
// routes.get('/news_user_details', verifyAccessToken, userController.saveNewsUserDetails);
routes.get('/delete_self_service_report/:ssrId', verifyAccessToken, userController.deleteSelfServiceReport);

module.exports = routes;
