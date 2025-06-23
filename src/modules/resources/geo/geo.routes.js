import { Router } from 'express';
import validate from 'express-validation';

import { authJwt } from '../../../services/auth.services';

import * as geoController from './geo.controller';
import geoValidation from './geo.validations';

const routes = new Router();

routes.post('/:rid/countries/', authJwt, validate(geoValidation.addCountries), geoController.addCountries);
routes.post('/', authJwt, validate(geoValidation.addRegions), geoController.addRegions);
routes.get('/:rid*?/', authJwt, validate(geoValidation.getGeoData), geoController.getGeoData);

export default routes;
