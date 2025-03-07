const HTTPStatus = require('http-status');
const mongoose = require('mongoose');
const Reports = require('../Models/Reports.Model');
const _ = require("lodash");
const utilities = require('../utilities/utils');


// Controller to get chart data
// const getChartData = async (req, res) => {
//     try {
//         const reportId = req.params['rid'] || null;
//         const chartSearchName = req.query['q'] || '';

//         // Construct the initial match query for fetching chart data
//         let initialMatchQuery = {};

//         if (reportId) {
//             initialMatchQuery = { "_id": mongoose.Types.ObjectId(reportId) };
//         }

//         initialMatchQuery = {
//             ...initialMatchQuery,
//             "$or": [
//                 { "toc.content.type": "CHART" },
//                 { "toc.content.data.type": "CHART" },
//                 { "toc.content.type": "PIE" },
//                 { "toc.content.data.type": "PIE" },
//                 { "toc.content.type": "BAR" },
//                 { "toc.content.data.type": "BAR" }
//             ]
//         };

//         // Fetch chart data from the database
//         const chartData = await Reports.aggregate([
//             { "$match": { "approved": true, "titles": { $exists: true, $ne: null, $type: "array" } } },
//             { "$match": initialMatchQuery },
//             { "$unwind": "$toc" },
//             { "$unwind": "$toc.content" },
//             { "$unwind": "$toc.content.data" },
//             { "$match": { 
//                 "$or": [
//                     { "toc.content.data.type": "CHART" },
//                     { "toc.content.data.type": "PIE" },
//                     { "toc.content.data.type": "BAR" },
//                     { "toc.content.type": "CHART" },
//                     { "toc.content.type": "PIE" },
//                     { "toc.content.type": "BAR" },
//                     { "toc.content.type": "IMAGE", "toc.content.data.type": "1" }
//                 ] 
//             }},
//             { "$project": { "toc.section_name": 1, "toc.section_id": 1, "toc.content": 1 } }
//         ]);

//         // Split the search terms by comma and trim each term
//         const searchTerms = chartSearchName.split(',').map(term => term.trim());

//         // Create an array of regex conditions for each search term
//         const regexConditions = searchTerms.map(term => ({
//             "toc.content.data.title": { $regex: term, $options: "i" }
//         }));

//         // Fetch additional charts by title using the constructed `$or` array
//         const meChartsData = await Reports.aggregate([
//             {
//                 "$match": {
//                     "$or": regexConditions
//                 }
//             }
//         ]);

//         // Handle case where no chart data is found
//         if (!chartData.length) {
//             return res.status(HTTPStatus.NOT_FOUND).json({ error: true, message: 'No chart data found' });
//         }

//         // Handle case where no meChartsData is found
//         if (!meChartsData.length) {
//             console.warn("No charts found matching the titles.");
//         }

//         // Send the fetched data as a response
//         return res.status(HTTPStatus.OK).json({ chartData, meChartsData });

//     } catch (error) {
//         console.error('Error fetching chart data:', error);
//         return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({ error: true, message: error.message });
//     }
// };

// Controller to get charts count
// const getChartsCount = async (req, res) => {
//     try {
//         const queryRes = await Reports.aggregate([
//             {
//                 $match: {
//                     approved: true,
//                     titles: { $exists: true, $ne: null, $type: "array" }
//                 }
//             },
//             {
//                 $group: {
//                     _id: null,
//                     count: { $sum: { $size: "$titles" } }
//                 }
//             }
//         ]);

//         return res.status(HTTPStatus.OK).json(queryRes);
//     } catch (error) {
//         console.error('Error fetching charts count:', error);
//         return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({ error: true, message: error.message });
//     }
// };

// Export controllers

const getChartDataFromDB = async(reportId, chartSearchName) => {
    let initialMatchQuery = {};
    if (!utilities.isEmpty(reportId)) {
      initialMatchQuery._id = mongoose.Types.ObjectId(reportId);
    }
  
    initialMatchQuery.$or = [
      { "toc.content.type": "CHART" },
      { "toc.content.data.type": "CHART" },
      { "toc.content.type": "PIE" },
      { "toc.content.data.type": "PIE" },
      { "toc.content.type": "BAR" },
      { "toc.content.data.type": "BAR" },
    ];
  
    let contentMatchQuery = {
      $and: [
        {
          $or: [
            { "toc.content.data.type": "CHART" },
            { "toc.content.data.type": "PIE" },
            { "toc.content.data.type": "BAR" },
            { "toc.content.type": "CHART" },
            { "toc.content.type": "PIE" },
            { "toc.content.type": "BAR" },
            { "toc.content.type": "IMAGE", "toc.content.data.type": "1" },
          ],
        },
      ],
    };
  
    if (!utilities.isEmpty(chartSearchName)) {
      const searchTerms = chartSearchName.split(",").map((term) => term.trim());
      const regexQueries = searchTerms.map((searchTerm) => ({
        $or: [
          { "toc.content.data.title": { $regex: searchTerm, $options: "i" } },
          { "toc.content.title": { $regex: searchTerm, $options: "i" } },
        ],
      }));
  
      contentMatchQuery["$and"].push({ $or: regexQueries });
    }
  
    return await Reports.aggregate([
      { $match: { approved: true, titles: { $exists: true, $ne: null, $type: "array" } } },
      { $match: initialMatchQuery },
      { $unwind: "$toc" },
      { $unwind: "$toc.content" },
      { $unwind: "$toc.content.data" },
      { $match: contentMatchQuery },
      {
        $project: {
          "toc.section_name": 1,
          "toc.section_id": 1,
          section_pid: 1,
          main_section_id: 1,
          "toc.content": 1,
        },
      },
    ]);
}

const getMeChartsByTitles =  async(str) =>{
    if (utilities.isEmpty(str)) return [];

    const titles = str.split(",").map((title) => decodeURIComponent(title.trim()));
    const regexTerms = titles.map((title) => new RegExp(title, "i"));
  
    return Reports.find({ "titles.title": { $in: regexTerms } })
      .select("titles _id title")
      .lean()
      .exec();
}

module.exports = {
    getChartData : async (req, res) => {
        try {
            let reportId = req.params["rid"] || null;
            const chartName = req.query["q"];
        
            // Fetch Chart Data
            let chartData = {};
            try {
              chartData = await getChartDataFromDB(reportId, chartName);
            } catch (er) {
              console.error("Exception while getting chart details by name:", er);
              return res
                .status(HTTPStatus.BAD_REQUEST)
                .json({ error: true, message: er.message });
            }
        
            // Fetch MeCharts Data
            let meChartsData = [];
            try {
              meChartsData = await getMeChartsByTitles(chartName);
            } catch (er) {
              console.error("Exception while getting MeCharts data:", er);
              return res
                .status(HTTPStatus.BAD_REQUEST)
                .json({ error: true, message: er.message });
            }
        
            // Return response
            return res.status(HTTPStatus.OK).json({ chartData, meChartsData });
          } catch (er) {
            return res
              .status(HTTPStatus.INTERNAL_SERVER_ERROR)
              .json({ error: true, message: er.message });
          }
    }
    
};