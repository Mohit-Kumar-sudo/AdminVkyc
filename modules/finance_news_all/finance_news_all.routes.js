import { Router } from 'express';
import * as allFinanceNewsController from './finance_news_all.controllers';

const routes = new Router();

routes.post('/all-finance-news', allFinanceNewsController.getAllFinanceNewsScrapping);

export default routes;


