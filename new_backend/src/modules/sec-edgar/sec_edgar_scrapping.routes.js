import { Router } from 'express';
import * as secEdgarScrappingController from './sec_edgar_scrapping.controllers';

const routes = new Router();

routes.post('/sec-edgar/', secEdgarScrappingController.getSecEdgarScrapping);

export default routes;


