import { Router } from 'express';
import * as googleScrappingController from './google_scrapping.controllers';

const routes = new Router();

routes.get('/scrape/:searchQuery/:start', googleScrappingController.getScrapping);

export default routes;


