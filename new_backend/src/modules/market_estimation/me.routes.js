import { Router } from 'express';
import validate from 'express-validation';

import { authJwt } from '../../services/auth.services';

import * as meController from './me.controller';
import meValidation from './me.validations';

const routes = new Router();

// routes.post('/:rid/segment', authJwt, meController.addSegments);
// routes.get('/:rid/data', authJwt, validate(meValidation.getMEData), meController.getMEData);
routes.get('/:rid/views' , validate(meValidation.getMEViewsData) , meController.getMEViewsData);
routes.get('/:rid/by_region/:region_id', authJwt , meController.getByRegion);
routes.get('/:rid/by_segment/:segment_id', authJwt , meController.getBySegment);

// routes.post('/:rid/grid/data', authJwt, validate(meValidation.addMEData), meController.addMEData);
// routes.post('/:rid/geo', authJwt, validate(meValidation.addMEGeoData), meController.addMEGeoData);
// routes.post('/:rid/grid/data/text', authJwt, validate(meValidation.saveDataForGridTables), meController.saveDataForGridTables);

// routes.put('/:tocid', authJwt, validate(tocValidation.updateContent), tocController.updateContent);

export default routes;
