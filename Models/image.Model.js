const mongoose = require('mongoose');
const { Schema, SchemaTypes } = mongoose;
import utilities from '../../../utilities/utils';
import reportModel from '../../reports/report.model';


// GET Chart search data - report specific or across reports
const getImageData = async function (reportId, chartSearchName) {
    let initialMatchQuery = {};
    if (!utilities.isEmpty(reportId)) {
        initialMatchQuery = {...initialMatchQuery, ...{"_id": mongoose.Types.ObjectId(reportId) }};
    }
    initialMatchQuery = {...initialMatchQuery, ...{"toc.content.type": "IMAGE"}};

    let contentMatchQuery = {   // matches the data type = IMAGE
        "$and": [{
            "$or": [
                {
                    "toc.content.data.type": "IMAGE"
                },
                {
                    "toc.content.type": "IMAGE"
                }
            ]
        }]
    };
    if (!utilities.isEmpty(chartSearchName)) {      // matches for the custom input string
        contentMatchQuery["$and"].push({
            "$or": [
                  {
                      "toc.content.data.title": { "$regex": chartSearchName, "$options": "i" }
                  },
                  {
                      "toc.content.title": { "$regex": chartSearchName, "$options": "i" }
                  }
              ]
          });
    }


    const queryRes = await reportModel.Reports.aggregate([
        {
          "$match": initialMatchQuery
        },
        {
          "$unwind": "$toc"
        },
        {
          "$unwind": "$toc.content"
        },
        {
          "$unwind": "$toc.content.data"
        },
        {
          "$match": contentMatchQuery
        },
        {
          "$project": {
              "toc.section_name" :1,
              "toc.section_id":1,
              "section_pid":1,
              "main_section_id":1,
              "toc.content": 1,
          }
        }
      ]);

    return queryRes;
}

// Exporting model to external world
module.exports = {
    getImageData
};