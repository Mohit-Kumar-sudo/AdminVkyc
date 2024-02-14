import { Router } from 'express';
import * as chat_bot from './chat_bot.controller';

const routes = new Router();

routes.post('/chatData', chat_bot.getChatBot);

routes.post('/fetchReport', chat_bot.fetchReport);

export default routes;
