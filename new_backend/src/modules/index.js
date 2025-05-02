import userRoutes from './users/user.routes';
import { authJwt } from '../services/auth.services';
import reportRoutes from './reports/report.routes';
import tocRoutes from './table_of_contents/toc.routes';
import geoRoutes from './resources/geo/geo.routes';
import verticalRoutes from './resources/verticals/verticals.routes';
import meRoutes from './market_estimation/me.routes';
import uploadRoutes from './resources/upload/upload.routes';
import companyRoutes from './company_profile/cp.routes';
import googleAPIRoutes from './google_api/google_api.routes';
import scrappingRoutes from './google-scrapping/google_scrapping.routes';
import videoScrappingRoutes from './video-scrapping/video_scrapping.routes';
import youtubeRoutes from './youtube/youtube.routes';
import secEdgarRoutes from './sec-edgar/sec_edgar_scrapping.routes';
import secDataRoutes from './sec-data/sec_data.routes';
import secSearchDataRoutes from './sec-search/sec_search.routes';
import secRawDataRoutes from './sec-raw-data/sec_raw_data.routes';
import secDocumentRoutes from './sec-document/sec_document.routes';
import rlmRoutes from './reports-leftmenu/rlm.routes';
import financeRoutes from './finance_news/finance_news.routes';
import allFinanceRoutes from './finance_news_all/finance_news_all.routes';
import stockRoutes from './stock_filter_marquee/stock.routes';
import allVideosRoutes from './videos-filter/videos-filter.routes';
import dayRoutes from './one_day_stocks/day.routes';
import twitterRoutes from './twitter/twitter.routes';
import googleApiStatusRoutes from './google-scrapping-status/google_scrapping_status.routes';
import leadsRoutes from './leads_db/leads-db.routes';
import cikRoutes from './sec_cik/sec.routes';
import chartRoutes from './resources/chart/chart.routes';
import tableRoutes from './resources/table/table.routes';
import imageRoutes from './resources/image/image.routes';
import prefsRoutes from './resources/preferences/prefs.routes';
import sec10kRoutes from './10k _sec_edgar/sec.routes';
import statusRoutes from './report_status/rs.routes';
import leadRoutes from './leads/leads.routes';
import whatsAppRoutes from './whatsapp/whatsapp.routes';
import companyCikRoutes from './cikCompany/cik.routes';
import duplicateCPRoutes from './duplicate_cp/dcp.routes';
import secSearchNewRoutes from './sec-search-new/sec_search_new.routes';
import websiteRoutes from './website/website.routes';
import reqHistoryRoutes from './requests_history/requests_history.route'
import chatBot from './chat_bot/chat_bot.routes';
import reportsAccess from './reports_access/reports_access.route';
import userCredits from './user_credits/user_credits.route'

const cors = require('cors');

export default app => {
  // cors
  app.use(cors());

  // users routes
  app.use('/api/v1/users', userRoutes);

  // report routes
  app.use('/api/v1/report', reportRoutes);

  // toc routes
  app.use('/api/v1/', tocRoutes);

  // resources.geo routes
  app.use('/api/v1/geo/', geoRoutes);

  // resources.verticals routes
  app.use('/api/v1/vertical/', verticalRoutes);

  // me routes
  app.use('/api/v1/me/', meRoutes);

  // google API Routes
  app.use('/api/v1/google_api/', googleAPIRoutes);

  // upload routes
  app.use('/api/v1/upload/', uploadRoutes);

  // company profile routes
  app.use('/api/v1/company/', companyRoutes);

  // report left menu routes
  app.use('/api/v1/left_menu/', rlmRoutes);

  // chart routes
  app.use('/api/v1/chart/', chartRoutes);

 //history routes
 app.use('/api/v1/history/',reqHistoryRoutes);

  // table routes
  app.use('/api/v1/table/', tableRoutes);

  // image routes
  app.use('/api/v1/image/', imageRoutes);

  // WhatsApp routes
  app.use('/api/v1/whatsapp/', whatsAppRoutes);

  // Website routes
  app.use('/api/v1/website/', websiteRoutes);

  // chatbot routes
  app.use('/api/v1/chatbot', chatBot);

  // reports access routes
  app.use('/api/v1/reportAccess', reportsAccess)

  // user credits routes
  app.use('/api/v1/userCredits', userCredits)

  // user preferences APIs
  app.use('/api/v1/prefs/', prefsRoutes);

  app.use('/hello', authJwt, (req, res) => {
    res.send('This is private route');
  });

  app.use('/api/v1/leads/', leadsRoutes);
  app.use('', scrappingRoutes);
  app.use('', videoScrappingRoutes);
  app.use('', youtubeRoutes);
  app.use('', secEdgarRoutes);
  app.use('', secDataRoutes);
  app.use('', secSearchDataRoutes);
  app.use('', secRawDataRoutes);
  app.use('', secDocumentRoutes);
  app.use('', financeRoutes);
  app.use('', allFinanceRoutes);
  app.use('', stockRoutes);
  app.use('', allVideosRoutes);
  app.use('', dayRoutes);
  app.use('', twitterRoutes)
  app.use('', googleApiStatusRoutes);
  app.use('', cikRoutes);
  app.use('', sec10kRoutes);
  app.use('', statusRoutes);
  app.use('', leadRoutes)
  app.use('/api/v1', companyCikRoutes)
  app.use('/api/v1', duplicateCPRoutes)
  app.use('', secSearchNewRoutes);
};
