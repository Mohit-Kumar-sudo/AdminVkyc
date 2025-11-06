const axios = require('axios');
const cheerio = require('cheerio');

var savedData = {};

export async function getSecSearchData(req, res) {
  try {
    let { searchQuery, formType, company_name, from_date, to_date, page } = req.params;
    if (from_date) {
      from_date = from_date.toString().replace(/-/g, "/");
    }
    if (to_date) {
      to_date = to_date.toString().replace(/-/g, "/");
    }

    if (formType.includes("All Forms") || formType === "undefined") {
      formType = 1;
    } else {
      formType = "Form" + formType;
    }

    searchQuery = searchQuery || "*";

    let searchUrl = `https://searchwww.sec.gov/EDGARFSClient/jsp/EDGAR_MainAccess.jsp?search_text=${searchQuery}&sort=Date&formType=${formType}&isAdv=true&stemming=true&startDoc=${page}&queryCo=${company_name}`;

    if (from_date !== "undefined" && from_date !== "null" && to_date !== "undefined" && to_date !== "null") {
      searchUrl += `&fromDate=${from_date}&toDate=${to_date}`;
    }
    searchUrl += "&numResults=10";

    let headers = {
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "DNT": "1",
      "Pragma": "no-cache",
      "Referer": "https://www.sec.gov",
      "Upgrade-Insecure-Requests": "1",
      "User-Agent": "MarketResearchFuture AdminContact@marketresearchfuture.com"
    };

    // Generate a unique cache key based on the request parameters
    const cacheKey = `getSecSearchData-${searchQuery}-${formType}-${company_name}-${from_date}-${to_date}-${page}`;

    const response = await axios.get(searchUrl, { headers });

    if (response.data) {
      let htmlData = response.data;
      const $ = cheerio.load(htmlData);
      savedData.data = [];

      let results;
      let totalResults;
      let paging;

      $("table#header > tbody > tr").each(function(i, ele) {
        savedData.pagination = {};
        if (i === 0) {
          results = $(this).text();
          results = results.split("Printer")[0];
          totalResults = results.split(" ")[4];

          savedData.pagination.totalResults = totalResults;
          savedData.pagination.results = results;
        } else if (i === 1) {
          paging = $(this).text().split("  ");
          savedData.pagination.paging = paging;
        }
      });

      if (paging) {
        let index = paging.indexOf("Previous");
        if (index > -1) paging.splice(index, 1);

        index = paging.indexOf("Next");
        if (index > -1) paging.splice(index, 1);
      }

      savedData.pagination = { results, totalResults, paging };

      $("td.iframe > div > table > tbody > tr").each(function(i, tdData) {
        if ($(tdData).hasClass("infoBorder")) {
          i++;
          const report_name = $(tdData).text();
          let url = $(tdData).find("a.filing").attr("href");
          let mainUrl = "";

          if (url) {
            url = url.split("javascript:opennew('")[1].split("','")[0];
            mainUrl = url.split("http://www.sec.gov/Archives/edgar/data/")[1].split(".htm")[0];
          }

          const dates = report_name.match(/\d{2}(\D)\d{2}\1\d{4}/g);
          let date = "";
          let name = "";

          if (dates) {
            date = dates[0];
            name = report_name.split(dates[0])[1];
          }

          i++;
          const company_name = $(tdData).text();
          i++;
          const description = $(tdData).text();
          let keyword = description;

          if (description && $(tdData).find("font").length > 0) {
            keyword = $(tdData).find("font").length === 1 
              ? $(tdData).find("font").text()
              : $(tdData).find("font").first().text();
          }

          if (date && description) {
            savedData.data.push({
              date, name, company_name, description, url, mainUrl, keyword
            });
          }
        }
      });

      return res.json(savedData);
    } else {
      return res.json({ error: "No data" });
    }
  } catch (err) {
    return res.json({ error: err.message });
  }
}
