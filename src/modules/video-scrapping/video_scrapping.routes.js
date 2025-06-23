import { Router } from 'express';
import * as videoScrappingController from './video_scrapping.controllers';
import { authJwt } from '../../services/auth.services';

const routes = new Router();

routes.get('/video-scrape/:searchQuery/:start', videoScrappingController.getVideoScrapping);

export default routes;


