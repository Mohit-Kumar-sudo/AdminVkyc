const request = require("request").defaults({ encoding: null });
const cheerio = require("cheerio");
const { getFromRedis, setToRedis } = require('../../config/redis');

var savedData = {};

export async function getSecSearchData(req, res) {
  try {
    var searchText = req.params.searchQuery;
    var formType = req.params.formType;
    var company_name = req.params.company_name;
    var from_date = req.params.from_date;
    var to_date = req.params.to_date;
    if (from_date) {
      from_date = from_date.toString().replace(/-/g, "/");
    }
    if (to_date) {
      to_date = to_date.toString().replace(/-/g, "/");
    }
    var page = req.params.page;

    if (formType.includes("All Forms") || formType == "undefined") {
      formType = 1;
    } else {
      formType = "Form" + formType;
    }

    if (!searchText) {
      searchText = "*";
    }

    var searchUrl =
      "https://searchwww.sec.gov/EDGARFSClient/jsp/EDGAR_MainAccess.jsp?search_text=" +
      searchText +
      "&sort=Date&formType=" +
      formType +
      "&isAdv=true&stemming=true&startDoc=" +
      page +
      "&queryCo=" +
      company_name;

    if (
      from_date != "undefined" &&
      from_date != "null" &&
      to_date != "undefined" &&
      to_date != "null"
    ) {
      searchUrl += "&fromDate=" + from_date + "&toDate=" + to_date;
    }
    searchUrl += "&numResults=10";
    var headers = {};

    //headers["host"] = req.headers["host"] && !req.headers["host"].includes("localhost") ? req.headers["host"] : "google.com";
    headers["pragma"] = req.headers["pragma"]
      ? req.headers["pragma"]
      : "no-cache";
    // headers["referer"] = req.headers["referer"] && !req.headers["referer"].includes("localhost") ? req.headers["referer"] : "https://www.google.com/";
    headers["sec-fetch-mode"] = req.headers["sec-fetch-mode"]
      ? req.headers["sec-fetch-mode"]
      : "cors";
    headers["sec-fetch-site"] = req.headers["sec-fetch-site"]
      ? req.headers["sec-fetch-site"]
      : "same-origin";
    headers["user-agent"] = req.headers["user-agent"]
      ? req.headers["user-agent"]
      : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36";

    // Generate a unique cache key based on the request parameters
    const cacheKey = `getSecSearchData-${searchText}-${formType}-${company_name}-${from_date}-${to_date}-${page}`;

    // Check if the data is already cached in Redis
    const cachedData = await getFromRedis(cacheKey);

    if (cachedData) {
      // If data is found in the cache, use the cached data
      return res.json(cachedData);
    } else {
      // If data is not found in the cache, fetch it from the SEC website
      request(
        {
          url: searchUrl,
          headers: headers
        },
        function(err, response, html) {
          if (err) {
            return res.json({ error: err });
          }
          if (html) {
            let htmlData = html.toString();
            var $ = cheerio.load(htmlData);
            savedData.data = [];

            var tdData = $("td.iframe>div>table> tbody > tr");

            let results;
            let totalResults;
            let paging;

            $("table#header >tbody>tr").each(function(i, ele) {
              savedData.pagination = {};
              if (i == 0) {
                results = $(this).text();
                results = results.split("Printer")[0];
                totalResults = results.split(" ")[4];

                savedData.pagination.totalResults = totalResults;
                savedData.pagination.results = results;
              } else if (i == 1) {
                paging = $(this).text();
                paging = paging.split("  ");
                savedData.pagination.paging = paging;
              }
            });

            if (paging) {
              var index = paging.indexOf("Previous");
              if (index > -1) {
                paging.splice(index, 1);
              }

              var index = paging.indexOf("Next");
              if (index > -1) {
                paging.splice(index, 1);
              }
            }
            savedData.pagination = {
              results: results,
              totalResults: totalResults,
              paging: paging
            };

            for (let i = 0; i < tdData.length; i++) {
              if ($(tdData[i]).hasClass("infoBorder")) {
                i++;
                var report_name = $(tdData[i]).text();
                var url = $(tdData[i])
                  .find("a.filing")
                  .attr("href");
                var mainUrl = "";
                if (url) {
                  url = url.split("javascript:opennew('")[1].split("','")[0];
                  mainUrl = url
                    .split("http://www.sec.gov/Archives/edgar/data/")[1]
                    .split(".htm")[0];
                }
                var dates = report_name.match(/\d{2}(\D)\d{2}\1\d{4}/g);
                var date = "";
                if (dates) {
                  date = dates[0];
                  var name = report_name.split(dates[0])[1];
                }

                i++;
                var company_name = $(tdData[i]).text();
                i++;
                var description = $(tdData[i]).text();
                var keyword = "";
                if (description) {
                  if ($(tdData[i]).find("font")) {
                    if ($(tdData[i]).find("font")) {
                      if ($(tdData[i]).find("font").length == 1) {
                        keyword = $(tdData[i])
                          .find("font")
                          .text();
                      } else if ($(tdData[i]).find("font").length > 1) {
                        keyword = $(tdData[i]).find("font")["0"].children[0]
                          .data;
                      } else {
                        keyword = searchText;
                      }
                    }
                  }
                }

                if (date && description) {
                  savedData.data.push({
                    date: date,
                    name: name,
                    company_name: company_name,
                    description: description,
                    url: url,
                    mainUrl: mainUrl,
                    keyword: keyword
                  });
                }
              }
            }
            // Store the fetched data in the Redis cache for future use
            setToRedis(cacheKey, savedData);

            // Send the fetched SEC search data as a response
            return res.json(savedData);
          } else {
           return res.json({ error: "No data" });
          }
        }
      );
    }
  } catch (err) {
    return res.json({ error: err });
  }
}
