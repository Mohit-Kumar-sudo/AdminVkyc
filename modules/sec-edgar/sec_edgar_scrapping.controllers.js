const request = require('request').defaults({ encoding: null });
const cheerio = require('cheerio');

var savedData = {};

export async function getSecEdgarScrapping(req, res) {
  try {
    var data = req.body;
    var $ = cheerio.load(data);

      var htmlData = $.parseHTML( data ); 
    savedData.data = [];

    var tdData = $('td.iframe>div>table> tbody > tr');

    for (let i = 0; i < tdData.length; i++) {
      if ($(tdData[i]).hasClass('infoBorder')) {
        i++;
        var report_name = $(tdData[i]).text();
        i++;
        var company_name = $(tdData[i]).text();
        i++;
        var description = $(tdData[i]).text();

        savedData.data.push({
          report_name: report_name,
          company_name: company_name,
          description: description
        });
      }
    }
    res.json(JSON.stringify(savedData));

  } catch (err) {
    console.log(err);
  }
}


