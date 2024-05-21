import { Router } from 'express';
import * as secDocumentController from './sec_document.controllers';

const routes = new Router();

routes.post('/sec-document/', secDocumentController.getDocument);

export default routes;


