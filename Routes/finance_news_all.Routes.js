import { Router } from 'express';
import * as allFinanceNewsController from '../Controllers/finance_news_all.Controller';

const routes = new Router();

routes.post('/all-finance-news', allFinanceNewsController.getAllFinanceNewsScrapping);

export default routes;