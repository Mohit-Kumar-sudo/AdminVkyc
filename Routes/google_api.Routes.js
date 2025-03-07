import {Router} from 'express';
import * as googleAPIController from '../Controllers/google_api.Controller';
import {authJwt} from '../../services/auth.services';

const routes = new Router();

routes.get('/:google_search_query', authJwt, googleAPIController.getGoogleNews);

export default routes;