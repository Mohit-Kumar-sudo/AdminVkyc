import { Router } from 'express';
import * as googleScrappingController from './google_scrapping_status.controllers';

const routes = new Router();

routes.get('/scrape-status/:searchQuery/:start', googleScrappingController.getScrappingStatus);

export default routes;


