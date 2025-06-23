import { Router } from 'express';
import * as youtubeController from './youtube.controllers';

const routes = new Router();

routes.get('/youtube', youtubeController.getYoutube);

export default routes;


