import mongoose, { Schema, SchemaTypes } from 'mongoose';
import utilities from '../../../utilities/utils';
import reportModel from '../Models/Reports.Model';


// GET Table search data - report specific or across reports
const getTableData = async function (reportId, tableSearchName) {
    let initialMatchQuery = {};
    if (!utilities.isEmpty(reportId)) {
        initialMatchQuery = {...initialMatchQuery, ...{"_id": mongoose.Types.ObjectId(reportId) }};
    }
    initialMatchQuery = {...initialMatchQuery, ...{"toc.content.type": "TABLE"}};

    let contentMatchQuery = {   // matches the data type = TABLE
        "$and": [{
            "$or": [
                {
                    "toc.content.type": "TABLE"
                },
                {
                  "toc.content.type": "IMAGE",
                  "toc.content.data.type": "2", // FOR IMAGE AS TABLE
                }
            ]
        }]
    };
    if (!utilities.isEmpty(tableSearchName)) {      // matches for the custom inpur string
        contentMatchQuery["$and"].push({
            "$or": [
                  {
                      "toc.content.data.title": { "$regex": tableSearchName, "$options": "i" }
                  },
                  {
                      "toc.content.title": { "$regex": tableSearchName, "$options": "i" }
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
    getTableData
};