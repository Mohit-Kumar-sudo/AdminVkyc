const request = require('request').defaults({ encoding: null });

// Function to get leads data from an external API
async function getLeadsData(req, res) {
  try {
    // If data is not cached, perform the request
    var searchUrl = 'http://172.16.0.101/industry_stats?access_key=e4e98249d561da9';
    request({ url: searchUrl }, function (err, response, html) {
      if (err) {
        return res.status(500).send(err);
      }

      const responseData = html.toString();
      res.send(responseData); // Send external API response
    });
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal Server Error'); // Respond with an error if there's an exception
  }
}

// Function to get leads by company name from an external API
async function getLeadsByCompanyName(req, res) {
  var company = req.params.company;
  try {
    // If data is not cached, perform the request
    var searchUrl = `http://crm.itknowledgestore.com/company_search?access_key=e4e98249d561da9&comp_name=${company}`;
    request({ url: searchUrl }, function (err, response, html) {
      if (err) {
        return res.status(500).send(err);
      }

      const responseData = html.toString();
      res.send(responseData);
    });
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal Server Error');
  }
}

// Function to get leads by industry from an external API
async function getLeadsByIndustry(req, res) {
  var industry = req.params.industry;
  try {
    // If data is not cached, perform the request
    var searchUrl = `http://crm.itknowledgestore.com/industry_search?access_key=e4e98249d561da9&industry=${industry}`;
    request({ url: searchUrl }, function (err, response, html) {
      if (err) {
        return res.status(500).send(err);
      }

      const responseData = html.toString();
      res.send(responseData);
    });
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal Server Error');
  }
}

// Export the functions using CommonJS syntax
module.exports = {
  getLeadsData,
  getLeadsByCompanyName,
  getLeadsByIndustry
};