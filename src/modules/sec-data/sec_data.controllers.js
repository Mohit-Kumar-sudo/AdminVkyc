const request = require('request').defaults({ encoding: null });
const cheerio = require('cheerio');

var savedData = {};

export async function getSecData(req, res) {
  try {
    var searchTerm = req.params.searchQuery;
   // console.log("searchTerm", searchTerm);
    var searchUrl = 'https://www.sec.gov/cgi-bin/browse-edgar?CIK=' + searchTerm + '&owner=exclude&action=getcompany&Find=Search';
  //  console.log("url", searchUrl);
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

      $('tr').each(function (i, element) {
        var allTds = $(this).find('td');
        if (allTds.length == 5) {

          var filling = allTds[0].firstChild.data;
          var description = $(this).find('td.small').text()
          var fillingDate = allTds[3].firstChild.data;
          savedData.data.push({
            filling: filling,
            description: description,
            fillingDate: fillingDate,
          });
        }
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