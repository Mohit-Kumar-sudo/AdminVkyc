const dataConstants = require('../config/dataConstants');
const request = require('request').defaults({ encoding: null });
const cheerio = require('cheerio');
const _ = require('underscore');
const DOMParser = require('xmldom').DOMParser;

let savedData = {};

async function getScrapping(req, res) {
  try {
    const searchTerm = req.params.searchQuery;
    const start = req.params.start;

    const searchUrl = `https://news.google.com/rss/search?pz=1&cf=all&topic=topics&q=${searchTerm}+when:2h&gl=IN&num=2&start=${start}&hl=en`;
    const headers = {};

    headers["sec-fetch-mode"] = req.headers["sec-fetch-mode"] || "cors";
    headers["sec-fetch-site"] = req.headers["sec-fetch-site"] || "same-origin";
    headers["user-agent"] = req.headers["user-agent"] || "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36";
    headers["X-Forwarded-For"] = (req.connection.remoteAddress && req.connection.remoteAddress !== "::1") ? req.connection.remoteAddress : "66.171.248.170";
    headers["pragma"] = req.headers["pragma"] || "no-cache";

    request({
      url: searchUrl,
      headers: headers,
    }, function (err, response, data) {
      try {
        if (data !== null && data !== "") {
          data = data.toString();
        }

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data, "text/xml");

        const items = Array.from(xmlDoc.getElementsByTagName('item'));

        const feeds = [];
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
            });
          });

          const filteredData = feeds.filter(n => {
            return !temp.find(t => n.link === t.link);
          });

          res.json(filteredData);
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
  const htmlData = node.getElementsByTagName(tagToRetrieve)[0].textContent;
  return _.unescape(htmlData); // decode HTML entities, see lodash/underscore
};

module.exports = {
  getScrapping
};