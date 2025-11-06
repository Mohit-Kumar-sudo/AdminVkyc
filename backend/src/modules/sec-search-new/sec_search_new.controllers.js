const axios = require("axios");

export async function getSecSearchData(req, response) {
  const headers = {
    pragma: req.headers["pragma"] || "no-cache",
    "sec-fetch-mode": req.headers["sec-fetch-mode"] || "cors",
    "sec-fetch-site": req.headers["sec-fetch-site"] || "same-origin",
    "user-agent": req.headers["user-agent"]
      ? req.headers["user-agent"] + " MyCompanyBot/1.0"
      : "Mozilla/5.0 (compatible; MyCompanyBot/1.0)"
  };

  axios
    .post("https://efts.sec.gov/LATEST/search-index", req.body, { headers })
    .then(res => {
      console.log(res.data, "response.data");
      return response.json({ data: res.data });
    })
    .catch(err => {
      console.log("Error:", err);
      return response.json({ err: err });
    });
}
