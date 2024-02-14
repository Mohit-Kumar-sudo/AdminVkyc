import { Router } from 'express';
import validate from 'express-validation';

import { authJwt, authLocal } from '../../services/auth.services';
import * as userController from './user.controllers';
import userValidation from './user.validations';

const routes = new Router();

routes.post('/assign_reports/:userId', authJwt, userController.assignReports);
routes.get('/get_all_users', authJwt, userController.getAllUsers);
routes.post('/store_ppt', authJwt, userController.storeUserPPT);
routes.post('/add_dashboard', authJwt, userController.addDashboard);
routes.get('/get_user_ppts', authJwt, userController.getUserPPTs);
routes.get('/get_user_dashboards', authJwt, userController.getUserDashboards);
routes.delete('/delete_user_dashboards/:dashboardId', authJwt, userController.deleteUserDashboard);
routes.post('/add_slide/:pptId', authJwt, userController.addSlideToPpt);
routes.post('/signup', validate(userValidation.signup), userController.signUp);
routes.post('/login', authLocal, userController.login);
routes.get('/verify/:loginId', userController.getEmailConfirm);
routes.post('/verify/:loginId', userController.emailConfirm);
routes.get('/all_users/:key', authJwt, userController.allUsers);
routes.post('/access', authJwt, userController.adminConfirm);
routes.post('/self_service',authJwt,userController.mySelfServiceReports);
routes.get('/get_user_self_reports', authJwt, userController.getUserSelfServiceReports);
routes.get('/get_user_self_reports/:id', authJwt, userController.getSelfReportData);
routes.post('/update_user_self_reports/:id', authJwt, userController.updateSelfReportData);
routes.get('/youtube_video_details',authJwt, userController.saveYtUserDetails);
routes.get('/news_user_details', authJwt, userController.saveNewsUserDetails);
routes.get('/delete_self_service_report/:ssrId', authJwt, userController.deleteSelfServiceReport);

export default routes;
