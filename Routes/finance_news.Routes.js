import { Router } from 'express';
import * as financeNewsController from '../Controllers/finance_news.Controller';

const routes = new Router();

routes.get('/finance-news/:searchQuery', financeNewsController.getFinanceNewsScrapping);

export default routes;