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
    if (!utilities.isEmpty(chartSearchName)) {
        const searchTerms = chartSearchName.split(',');
        console.log('search', searchTerms)
        const regexQueries = searchTerms.map(searchTerm => ({
            $or: [
                { "toc.content.data.title": { $regex: searchTerm.trim(), $options: "i" } },
                { "toc.content.title": { $regex: searchTerm.trim(), $options: "i" } }
            ]
        }));
    
        contentMatchQuery["$and"].push({
            $or: regexQueries
        });
    }
    const queryRes = await reportModel.Reports.aggregate([
        {
           "$match": {
                "approved": true,
                "titles": { $exists: true, $ne: null, $type: "array" } 
            },
        },
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


const getChartsCount = async function () {   
        const queryRes = await reportModel.Reports.aggregate([
                {
                    $match: {
                        approved: true,
                        titles: { $exists: true, $ne: null, $type: "array" } 
                    }
                },
                {
                    $group: {
                        _id: null,
                        count: { $sum: { $size: "$titles" } }
                    }
                }
            ]);

        return queryRes;
}

// Exporting model to external world
module.exports = {
    getChartData,
    getChartsCount
};
