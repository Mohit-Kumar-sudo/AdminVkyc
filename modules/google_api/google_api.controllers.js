import HTTPStatus from 'http-status';
import utilities from "../../utilities/utils";

export async function getGoogleNews(req, res) {
  try {
    const GoogleNewsRss = require('google-news-rss');
    const googleNews = new GoogleNewsRss();
    googleNews
      .search(req.params.google_search_query)
      .then(resp => {
        return utilities.sendResponse(HTTPStatus.OK, resp, res);
      });
  } catch (err) {
    return res.status(HTTPStatus.BAD_REQUEST).json(err);
  }
}
