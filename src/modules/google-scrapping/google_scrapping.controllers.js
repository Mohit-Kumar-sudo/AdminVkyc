import dataConstants from '../../config/dataConstants';

const request = require('request').defaults({ encoding: null });
const cheerio = require('cheerio');
var _ = require('underscore');
var DOMParser = require('xmldom').DOMParser;

var savedData = {};

export async function getScrapping(req, res) {
  try {
    var searchTerm = req.params.searchQuery;
    var start = req.params.start;
    var searchUrl = `https://news.google.com/rss/search?pz=1&cf=all&topic=topics&q=${searchTerm}+when:2d&gl=IN&num=2&start=${start}&hl=en`;
    var headers = {};

    headers["sec-fetch-mode"] = req.headers["sec-fetch-mode"] ? req.headers["sec-fetch-mode"] : "cors";
    headers["sec-fetch-site"] = req.headers["sec-fetch-site"] ? req.headers["sec-fetch-site"] : "same-origin";
    headers["user-agent"] = req.headers["user-agent"] ? req.headers["user-agent"] : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36";
    headers["X-Forwarded-For"] = (req.connection.remoteAddress && req.connection.remoteAddress !== "::1") ? req.connection.remoteAddress : "66.171.248.170";
    // headers["host"] = (req.headers["host"] && !req.headers["host"].includes("localhost")) ? req.headers["host"] : "www.google.com";
    headers["pragma"] = req.headers["pragma"] ? req.headers["pragma"] : "no-cache";
    // headers["referer"] = (req.headers["referer"] && !req.headers["referer"].includes("localhost")) ? req.headers["referer"] : "marketfutureresearch.com";

    console.log(headers);

    request({
      url: searchUrl,
      headers: ["" + headers],
    }, function (err, response, data) {
      try {
        if (null !== data && data !== "") {
          data = data.toString();
        }

        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString(data, "text/xml");

        var items = Array.from(xmlDoc.getElementsByTagName('item'));

        var feeds = [];
        let temp = [];
        items.forEach(function (item) {
          feeds.push({
            title: getNode(item, 'title'),
            link: getNode(item, 'link'),
            published: getNode(item, 'pubDate'),
            text: getNode(item, 'description'),
            source: getNode(item, 'source'),
            img: getNode(item, 'guid'),
            linkExists: false
          });
        });
        
        if (feeds && feeds.length) {
          dataConstants.REMOVE_NEWS_LINKS.forEach(l => {
            feeds.forEach(f => {
              if (f.link.includes(l.toLowerCase())) {
                temp.push(f);
              }
            })
          })
          let data = feeds.filter(n=>{
            return !temp.find(t=>{
              return n.link === t.link
            })
          })
          res.json(data);
        }
      } catch (ex) {
        console.error("news parsing: " + ex);
      }
    });
  } catch (err) {
    console.log(err);
    console.error("Outside Exception!!!");
  }
}

// Retrieve the data of a specific tag
const getNode = function (node, tagToRetrieve) {
  var htmlData = node.getElementsByTagName(tagToRetrieve)[0].textContent;
  return _.unescape(htmlData); // decode HTML entities, see lodash/underscore
}
