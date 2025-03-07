import { Router } from 'express';
import * as googleScrappingController from '../Controllers/google_scrapping_status.Controller';

const routes = new Router();

routes.get('/scrape-status/:searchQuery/:start', googleScrappingController.getScrappingStatus);

export default routes;