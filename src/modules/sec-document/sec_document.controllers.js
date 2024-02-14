const request = require('request').defaults({ encoding: null });
const cheerio = require('cheerio');
import * as _ from 'lodash';

var savedData = {};

export async function getDocument(req, res) {
  try {
    var url = req.body.url;
    var keyword = req.body.keyword;
    console.log("url", url);
    var headers = {};

    //headers["host"] = req.headers["host"] && !req.headers["host"].includes("localhost") ? req.headers["host"] : "google.com";
    headers["pragma"] = req.headers["pragma"] ? req.headers["pragma"] : "no-cache";
    // headers["referer"] = req.headers["referer"] && !req.headers["referer"].includes("localhost") ? req.headers["referer"] : "https://www.google.com/";
    headers["sec-fetch-mode"] = req.headers["sec-fetch-mode"] ? req.headers["sec-fetch-mode"] : "cors";
    headers["sec-fetch-site"] = req.headers["sec-fetch-site"] ? req.headers["sec-fetch-site"] : "same-origin";
    headers["user-agent"] = req.headers["user-agent"] ? req.headers["user-agent"] : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36";

    request({
      url: url,
      headers: headers,
    }, function (err, response, html) {
      let htmlData = html.toString();

      var lastIndex = url.lastIndexOf('/');
      var mainUrl = url.substr(0, lastIndex);

      htmlData = htmlData.split(/src="/i).join('src="' + mainUrl + "/");
      let splitedData = htmlData.split(/href="/i);
      
      htmlData = '';

      for(let i=0;i<splitedData.length;i++){       
        
        if(i > 0){
          if(splitedData[i].startsWith('#')){
            let str = 'target="_blank" href="' + url + '#' + splitedData[i]
            htmlData = htmlData.concat(str);
          }else{
            let str1 = 'target="_blank" href="' + mainUrl + "/" + splitedData[i]
            htmlData =  htmlData.concat(str1);
          }
        }else{
          htmlData =  htmlData.concat(splitedData[0])
        }
      }

      var capti = _.startCase(_.toLower(keyword));
      htmlData = htmlData.split(keyword).join('<mark>' + keyword + '</mark>');
      htmlData = htmlData.split(keyword.toLowerCase()).join('<mark>' + keyword.toLowerCase() + '</mark>')
      htmlData = htmlData.split(keyword.toUpperCase()).join('<mark>' + keyword.toUpperCase() + '</mark>')
      htmlData = htmlData.split(capti).join('<mark>' + capti + '</mark>')

      if (err) {
        return res.status(500).send(err);
      }

      res.json(htmlData);
    });

  } catch (err) {
    console.log(err);
  }
}