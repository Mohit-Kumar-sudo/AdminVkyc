import HTTPStatus from 'http-status';

const request = require('request').defaults({ encoding: null });

export async function getYoutube(req, res) {
  try {
   // var searchTerm = req.params.searchQuery;
 //   console.log("searchTerm", searchTerm);

    var searchUrl = 'https://www.googleapis.com/youtube/v3/search?key=AIzaSyCH3fSQGF1gV6a-fHZ_Ihzab_w549YjWos&part=snippet&maxResults=5&q=mitali&type=video&relevanceLanguage=EN';
    var searchUrl1 = 'https://www.googleapis.com/youtube/v3/search?key=AIzaSyDFFRtIHjHuZ-tC9gfzZFaceqP4QtCVI08&part=snippet&maxResults=5&q=mitali&type=video&relevanceLanguage=EN';
    var searchUrl2 = 'https://www.googleapis.com/youtube/v3/search?key=AIzaSyCyvTWyXGu4lvbCBbUnIK9Qs5fCBmECNeA&part=snippet&maxResults=5&q=mitali&type=video&relevanceLanguage=EN';

    request({
      url: searchUrl
    }, function (err, response) {
      if (err) {
        return res.status(500).send(err);
      }
      res.json(response);
    }); 
  } catch (err) {
    return res.status(HTTPStatus.BAD_REQUEST).send(err);
  }
}