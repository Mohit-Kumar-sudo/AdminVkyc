import mongoose from "mongoose";
import HTTPStatus from "http-status";
import { Reports } from "../../reports/report.model"; // Assuming this is the correct path
import utilities from "../../../utilities/utils";
import * as _ from "lodash"

export async function getChartData(req, res) {
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
    console.log("Chart Names:", chartName);
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

// Function to fetch chart data from DB (previously in model)
async function getChartDataFromDB(reportId, chartSearchName) {
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

// Function to fetch MeCharts by title (previously in model)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function getMeChartsByTitles(str) {
  if (utilities.isEmpty(str)) return [];

  const titles = str.split(",").map((title) => decodeURIComponent(title.trim()));
  const regexTerms = titles.map((title) => new RegExp(title, "i"));
  console.log('Searching Titles:', regexTerms);
  // Fetch all reports containing any matching titles
  const reports = await Reports.find({ "titles.title": { $in: regexTerms } })
    .select("titles _id title")
    .lean()
    .exec();
  console.log("Reports Found:", reports.length);
  // Collect all matching titles from all reports
  let mergedTitles = [];
  for (const report of reports) {
    for (const t of report.titles) {
      if (regexTerms.some((regex) => regex.test(t.title))) {
        mergedTitles.push(t);
      }
    }
  }

  // 🔀 Jumble / shuffle the titles
  mergedTitles = shuffleArray(mergedTitles);

  // Return a single response object with jumbled titles
  return [{
    _id: reports.length > 0 ? reports[0]._id : null, // or keep null if not needed
    title: reports.length > 0 ? reports[0].title : null,
    titles: mergedTitles
  }];
}
