import { Router } from 'express';
import * as financeNewsController from './finance_news.controllers';

const routes = new Router();

routes.get('/finance-news/:searchQuery', financeNewsController.getFinanceNewsScrapping);

export default routes;


