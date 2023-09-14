const request = require('request').defaults({ encoding: null });
var savedData = {};

export async function getLeadsData(req, res) {
  try {
    var searchUrl = 'http://172.16.0.101/industry_stats?access_key=e4e98249d561da9';

    request({
      url: searchUrl
    }, function (err, response, html) {
     
        savedData  = html.toString()
        console.log(savedData)
      if (err) {
        return res.status(500).send(err);
      }

      res.send(savedData);
    });

  } catch (err) {
    console.log(err);
  }
}

export async function getLeadsByCompanyName(req, res) {
  var company = req.params.company;
  try {
    var searchUrl = 'http://crm.itknowledgestore.com/company_search?access_key=e4e98249d561da9&comp_name=' + company;

    request({
      url: searchUrl
    }, function (err, response, html) {
     
        savedData  = html.toString()
        console.log(savedData)
      if (err) {
        return res.status(500).send(err);
      }

      res.send(savedData);
    });

  } catch (err) {
    console.log(err);
  }
}

export async function getLeadsByIndustry(req, res) {
  var industry = req.params.industry;
  try {
    var searchUrl = 'http://crm.itknowledgestore.com/industry_search?access_key=e4e98249d561da9&industry=' + industry;

    request({
      url: searchUrl
    }, function (err, response, html) {
     
        savedData  = html.toString()
        console.log(savedData)
      if (err) {
        return res.status(500).send(err);
      }

      res.send(savedData);
    });

  } catch (err) {
    console.log(err);
  }
}



