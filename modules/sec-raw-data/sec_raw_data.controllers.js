const request = require('request').defaults({ encoding: null });
const cheerio = require('cheerio');

var savedData = {};

export async function getSecRawData(req, res) {
  try {
    var searchUrl = 'https://searchwww.sec.gov/EDGARFSClient/jsp/EDGAR_MainAccess.jsp?isAdv=true';
 //   console.log("Search url", searchUrl);
    var headers = {};

    //headers["host"] = req.headers["host"] && !req.headers["host"].includes("localhost") ? req.headers["host"] : "google.com";
    headers["pragma"] = req.headers["pragma"] ? req.headers["pragma"] : "no-cache";
    // headers["referer"] = req.headers["referer"] && !req.headers["referer"].includes("localhost") ? req.headers["referer"] : "https://www.google.com/";
    headers["sec-fetch-mode"] = req.headers["sec-fetch-mode"] ? req.headers["sec-fetch-mode"] : "cors";
    headers["sec-fetch-site"] = req.headers["sec-fetch-site"] ? req.headers["sec-fetch-site"] : "same-origin";
    headers["user-agent"] = req.headers["user-agent"] ? req.headers["user-agent"] : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36";

    request({
      url: searchUrl,
      headers: headers,
    }, function (err, response, html) {
      let htmlData = html.toString();
      var $ = cheerio.load(htmlData);
      savedData.data = [];

      $('tr#stem > td > select#formType > option').each(function (i, ele) {
        savedData.data.push($(this).text());
      })

      if (err) {
        return res.status(500).send(err);
      }

      res.json(JSON.stringify(savedData));
    });

  } catch (err) {
    console.log(err);
  }
}


