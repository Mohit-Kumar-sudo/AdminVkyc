const request = require('request').defaults({ encoding: null });
const cheerio = require('cheerio');

var savedData = {};

export async function getAllFinanceNewsScrapping(req, res) {
  console.log("In post");
  try {
    if(req.body.data && req.body.data.content){
      var content = req.body.data.content;
    
    let results = [];

    for(let i=1; i<content.length; i++){
      let currentContent = content[i]

      let searchTerm = currentContent.news;

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
  let financeNews = {
    name : currentContent.name,
    newsData : savedData
  }
  
  results.push(financeNews);

  if(i === content.length - 1){
    res.json(JSON.stringify(results));
  }

      });
 
    }


  }
    //res.json(JSON.stringify(results));


  } catch (err) {
    //return res.status(HTTPStatus.BAD_REQUEST).send(err);
    console.log(err);
  }
}