const request = require('request').defaults({ encoding: null });
const cheerio = require('cheerio');

var savedData = {};

export async function getVideoScrapping(req, res) {
  try {
    var searchTerm = req.params.searchQuery;
    var start = req.params.start;
    console.log("searchTerm", searchTerm);
    var searchUrl = 'https://www.google.com/search?q=' + searchTerm + '&tbm=vid&num=20' + '&start=' + start;
    console.log("url",searchUrl); 
    var headers = {};

    // headers["host"] = req.headers["host"] && !req.headers["host"].includes("localhost") ? req.headers["host"] : "www.google.com";
    headers["pragma"] = req.headers["pragma"] ? req.headers["pragma"] : "no-cache";
    // headers["referer"] = req.headers["referer"] && !req.headers["referer"].includes("localhost") ? req.headers["referer"] : "marketresearchfuture.com";
    headers["sec-fetch-mode"] = req.headers["sec-fetch-mode"] ? req.headers["sec-fetch-mode"] : "cors";
    headers["sec-fetch-site"] = req.headers["sec-fetch-site"] ? req.headers["sec-fetch-site"] : "same-origin";
    headers["user-agent"] = req.headers["user-agent"] ? req.headers["user-agent"] : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36";
    headers["X-Forwarded-For"] = (req.connection.remoteAddress && req.connection.remoteAddress !== "::1") ? req.connection.remoteAddress : "66.171.248.170";
    
    console.log(headers);

    

    request({
      url: searchUrl,
      headers: ["" + headers]
    }, function (err, response, html) {
      
      GoogleHtmlParser.parse({}, html, function(err, extractedDatas){
        console.log(extractedDatas);
      });

      // console.log("html: " + html);

      // First we'll check to make sure no errors occurred when making the request
      if (err) {
        console.log(err);
        return res.status(500).send(err);
      }
      
       var $ = cheerio.load(html);
       savedData.data = [];
      // For each outer div with class g, parse the desired data
      $('.g').each(function (i, element) {
        var title = $(this).find('span.S3Uucc').text();
        var link = $(this).find('.r').find('a').attr('href').replace('/url?q=', '').split('&')[0];
        var text = $(this).find('.st').text();
        var source = $(this).find('div.slp.f').text();
        var img = $(this).find('g-img>img').attr('src');
        // if(imgText[0])
        // console.log(imgText[0].innerHTML);
       
        savedData.data.push({
          title: title,
          link: link,
          text: text,
          img: img,
          source: source
        });
      });
      
      console.log($('td').length);
      savedData.pagination = [];
      $('td').each(function(i,element){
        let pageNumber = $(this).text();
        if(!isNaN(pageNumber) && pageNumber){
          if(parseInt(pageNumber) <=10){
            savedData.pagination.push(pageNumber);
            console.log($(this).text());
          }         
        }
      });

      try {
        res.json(JSON.stringify(savedData));
      } catch (ex) {
        console.error("video scrapping json.stringify: " + ex);
      }
      
    }); 

  } catch (err) {
    //return res.status(HTTPStatus.BAD_REQUEST).send(err);
    console.log(err);
  }
}