import { Router } from 'express';
import validate from 'express-validation';

import { authJwt } from '../../services/auth.services';

import * as tocController from './toc.controller';
import tocValidation from './toc.validations';

const routes = new Router();

routes.post('/:rid/toc/', authJwt, validate(tocValidation.addContent), tocController.addContent);
routes.get('/:rid/toc_by_msid/', authJwt, tocController.getTOCByMainSection);
routes.post('/:rid/toc/replace', authJwt, validate(tocValidation.replaceContent), tocController.replaceContent);
// routes.put('/:tocid', authJwt, validate(tocValidation.updateContent), tocController.updateContent);

routes.get('/:rid/toc/', authJwt, validate(tocValidation.getContent), tocController.getContent);
routes.get('/:rid/toc_by_key', authJwt, tocController.getContentByMetaKey);
routes.get('/:rid/toc_by_name', authJwt, tocController.getContentByMetaName);
routes.get('/:rid/toc_by_section_name', authJwt, tocController.getContentBySectionName);
routes.get('/:rid/toc/all', authJwt, validate(tocValidation.getAllReportContent), tocController.getAllReportContent);
routes.get('/:rid/content', authJwt, validate(tocValidation.getContentByKey), tocController.getContentByKey);
routes.get('/:rid/content/parent', authJwt, validate(tocValidation.getContentForSectionParent), tocController.getContentForSectionParent);

export default routes;
