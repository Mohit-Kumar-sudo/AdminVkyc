import mongoose, { Schema, SchemaTypes } from 'mongoose';
import utilities from '../../../utilities/utils';
import reportModel from '../../reports/report.model';


// GET Chart search data - report specific or across reports
const getChartData = async function (reportId, chartSearchName) {
    let initialMatchQuery = {};
    if (!utilities.isEmpty(reportId)) {
        initialMatchQuery = {...initialMatchQuery, ...{"_id": mongoose.Types.ObjectId(reportId) }};
    }
    initialMatchQuery = {...initialMatchQuery, ...{"$or": [{"toc.content.type": "CHART"}, {"toc.content.data.type": "CHART"}, {"toc.content.type": "PIE"}, {"toc.content.data.type": "PIE"}, {"toc.content.type": "BAR"}, {"toc.content.data.type": "BAR"}]}};

    let contentMatchQuery = {   // matches the data type = CHART / BAR / PIE
        "$and": [{
            "$or": [
                {
                    "toc.content.data.type": "CHART"
                },
                {
                    "toc.content.data.type": "PIE"
                },
                {
                    "toc.content.data.type": "BAR"
                },
                {
                    "toc.content.type": "CHART"
                },
                {
                    "toc.content.type": "PIE"
                },
                {
                    "toc.content.type": "BAR"
                },
                {
                    "toc.content.type": "IMAGE",
                    "toc.content.data.type": "1",   // FOR IMAGE AS CHART
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
    getChartData
};
