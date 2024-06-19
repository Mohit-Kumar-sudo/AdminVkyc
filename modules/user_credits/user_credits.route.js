import { Router } from "express";
import { authJwt } from "../../services/auth.services";

import * as userCreditsController from "./user_credits.controller";

const routes = new Router();

routes.post('/addCredits', authJwt, userCreditsController.addCredits)

routes.get('/getCredits', authJwt, userCreditsController.getCredits)

routes.post('/updateCredits', authJwt , userCreditsController.updateCredits)

export default routes