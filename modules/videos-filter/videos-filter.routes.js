import { Router } from 'express';

import * as videoController from './videos-filter.controller';

const routes = new Router();

routes.get('/videos-filter', videoController.getVideos);

export default routes;