const request = require('request').defaults({ encoding: null });
const cheerio = require('cheerio');

var savedData = {};

export async function getFinanceNewsScrapping(req, res) {
  try {
    var searchTerm = req.params.searchQuery;
    var start = req.params.start;

    var searchUrl = 'https://www.google.com/search?q=' + searchTerm + '&tbm=fin&wptab=NEWS';
    var headers = {};

    //headers["host"] = req.headers["host"] && !req.headers["host"].includes("localhost") ? req.headers["host"] : "google.com";
    headers["pragma"] = req.headers["pragma"] ? req.headers["pragma"] : "no-cache";
    //headers["referer"] = req.headers["referer"] && !req.headers["referer"].includes("localhost") ? req.headers["referer"] : "https://www.google.com/";
    headers["sec-fetch-mode"] = req.headers["sec-fetch-mode"] ? req.headers["sec-fetch-mode"] : "cors";
    headers["sec-fetch-site"] = req.headers["sec-fetch-site"] ? req.headers["sec-fetch-site"] : "same-origin";
    headers["user-agent"] = req.headers["user-agent"] ? req.headers["user-agent"] : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36";

    request({
      url: searchUrl,
      headers: headers
    }, function (err, response, html) {

      // First we'll check to make sure no errors occurred when making the request
      if (err) {
        return res.status(500).send(err);
      }

      var $ = cheerio.load(html);
      savedData.data = [];
      // For each outer div with class g, parse the desired data

      $('g-inner-card').each(function (ele, i) {
        var title =  $(this).find('.y9oXvf').text();
        var published = $(this).find('.tYlW7b').text();
        if($(this).find('img.rISBZc.M4dUYb')['0'])
        var img = $(this).find('img.rISBZc.M4dUYb')['0'].attribs['data-src'];
        var link =  $(this).find('a').attr('href');

        if(title && published){
          savedData.data.push({
            title: title,
            img: img,
            published: published,
            link: link
          });
        }
      })
      res.json(JSON.stringify(savedData));
    });

  } catch (err) {
    console.log(err);
  }
}