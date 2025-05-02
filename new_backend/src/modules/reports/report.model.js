import mongoose, { Schema, SchemaTypes } from "mongoose";
import validator from "validator";
import uniqueValidator from "mongoose-unique-validator";
import DATA_CONSTANTS from "../../config/dataConstants";
import utilities from "../../utilities/utils";
// import schemas
import MarketEstimationSchema from "../market_estimation/me.schema";
import TableOfContentSchema from "../table_of_contents/toc.schema";
import SecondaryContentSchema from "../secondary_content/sc.schema";
import * as _ from "lodash";
import dataConstants from "../../config/dataConstants";

const fs = require("fs");

// Report schema
const ReportSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      validate: {
        validator(title) {
          return validator.stripLow(title, false);
        },
        message: "{VALUE} is not a valid title."
      }
    },
    searching_title: {
      type: SchemaTypes.String,
      trim: true
    },
    title_prefix: { type: String, default: null },
    title_suffix: { type: String, default: "market" },
    category: {
      type: SchemaTypes.String,
      enum: Object.values(DATA_CONSTANTS.REPORT_CATEGORY),
      required: [true, "Report Category is required"]
    },
    vertical: {
      type: SchemaTypes.String,
      // required: [true, 'Report Vertical is required'],
      trim: true,
      index: true
    },
    owner: {
      type: Schema.Types.ObjectId,
      required: [true, "Owner details are required"],
      trim: true,
      ref: "users"
    },
    approver: {
      type: Schema.Types.ObjectId,
      trim: true,
      ref: "users"
    },
    approved: {
      type: Schema.Types.Boolean,
      default: false
    },
    pdfLink: {
      type: SchemaTypes.String,
      trim: true
    },
    excelLink: {
      type: SchemaTypes.String,
      trim: true
    },
    docLink: {
      type: SchemaTypes.String,
      trim: true
    },
    isPdf: {
      type: Schema.Types.Boolean,
      default: false
    },
    isExcel: {
      type: Schema.Types.Boolean,
      default: false
    },
    isDoc: {
      type: Schema.Types.Boolean,
      default: false
    },
    isAnalytics: {
      type: Schema.Types.Boolean,
      default: false
    },
    status: [
      {
        _id: false,
        main_section_id: { type: Schema.Types.Number, required: true },
        status: { type: Schema.Types.String }
      }
    ],
    titles: [
      {
        _id: false,
        title: { type: Schema.Types.String },
        type: { type: Schema.Types.String },
        id: { type: Schema.Types.String },
        key: { type: Schema.Types.String }
      }
    ],
    me: MarketEstimationSchema.schema, // market estimation data
    toc: [TableOfContentSchema.schema], // list of table of contents data,
    cp: [
      {
        company_name: { type: Schema.Types.String, required: true },
        company_id: {
          type: Schema.Types.ObjectId,
          ref: "company_profiles",
          trim: true,
          required: true
        },
        swot_analysis: [
          {
            _id: false,
            key: {
              type: Schema.Types.String,
              enum: Object.values(DATA_CONSTANTS.SWOT_ANALYSIS),
              required: true
            },
            value: [
              {
                _id: false,
                index_id: {
                  type: Schema.Types.String
                },
                name: {
                  type: Schema.Types.String,
                  trim: true
                }
              }
            ]
          }
        ],
        company_overview: [SecondaryContentSchema.schema],
        key_development: [SecondaryContentSchema.schema],
        strategy: [SecondaryContentSchema.schema]
      }
    ],
    tocList: { type: SchemaTypes.Mixed },
    overlaps: [
      {
        section_name: Schema.Types.String,
        data: [
          {
            report_id: {
              type: Schema.Types.ObjectId,
              ref: "reports",
              trim: true,
              required: true
            },
            report_name: Schema.Types.String
          }
        ]
      }
    ],
    youtubeContents: [
      {
        imgUrl: Schema.Types.String,
        videoid: Schema.Types.String,
        title: Schema.Types.String,
        publishedAt: Schema.Types.String
      }
    ]
  },
  {
    timestamps: true
  }
);
ReportSchema.plugin(uniqueValidator, {
  message: 'Title with "{VALUE}" already exists.'
});

ReportSchema.virtual("id").get(function() {
  return this._id.toHexString();
});

// Ensure virtual fields are serialised.
ReportSchema.set("toJSON", { virtuals: true });
ReportSchema.set("toObject", { virtuals: true });

const Reports = mongoose.model("reports", ReportSchema);

// Ensure indexes
Reports.createIndexes(err => {
  if (err) {
    console.error("Error ensuring indexes:", err);
  } else {
    console.log("Indexes ensured successfully");
  }
});

// create report
const createReport = function(reportDetails) {
  const rdetails = { ...reportDetails };
  let reportObj = new Reports(rdetails);
  reportObj = reportObj.save();
  return reportObj;
};

const getReports = user => {
  return Reports.aggregate([
    {
      $match: {
        approved: true,
        $or: [
          { isAnalytics: true },
          { isPdf: true }
        ]
      }
    },
    {
      $sort: { "createdAt": -1 }
    },
    {
      $group: {
        _id: "$vertical",
        count: { $sum: 1 },
        reports: {
          $push: {
            title: "$title",
            pdfLink: "$pdfLink",
            excelLink: "$excelLink",
            docLink: "$docLink",
            _id: "$_id",
            approved: "$approved",
            isPdf: "$isPdf",
            isExcel: "$isExcel",
            isDoc: "$isDoc",
            isAnalytics: "$isAnalytics",
            createdAt: "$createdAt",
          }
        }
      }
    }
  ]);
};

const getReportNameString = str => {
  let temp = str.replace(/[^a-zA-Z0-9 ]/g, " ").trim();
  temp = temp.replace(/ {2,}/g, " ");
  temp = temp.split(" ").join(" ");
  return temp;
};

const fetchReport = function(
  reportId,
  reportName = "",
  vertical,
  selectKeys,
  companyId,
  user
) {
  let query = [];
  if (reportId && vertical == null && !selectKeys) {
    query = Reports.find();
    if (
      user &&
      user.strictlyAllowedReportTypes &&
      user.strictlyAllowedReportTypes.length
    ) {
      query.where({ vertical: { $in: user.strictlyAllowedReportTypes } });
    }
    if (reportId) {
      query.where({ _id: new mongoose.Types.ObjectId(reportId) });
      query.select(
        "me.start_year me.end_year me.base_year overlaps youtubeContents"
      );
    } else if (reportName) {
      query.where({
        searching_title: { $regex: `\\b${reportName}\\b`, $options: "i" },
        approved: true
      });
    }

    if (user && user.reportIds && user.reportIds.length) {
      query.where({ _id: { $in: user.reportIds } });
    }

    if (vertical) {
      query.where({ vertical: vertical });
    }
    query.where({ approved: true });

    if (!utilities.isEmpty(selectKeys)) {
      let selKeysArr = [];
      selKeysArr = selectKeys.split(",");
      [
        "title",
        "vertical",
        "category",
        "owner",
        "status",
        "approver",
        "tocList",
        "title_prefix"
      ].forEach(item => {
        selKeysArr.push(item);
      });
      query.select(selKeysArr);
    } else {
      query.select(
        "title vertical category owner status approver tocList title_prefix"
      );
    }

    if (!utilities.isEmpty(companyId)) {
      query.where({ "cp.company_id": companyId });
    }
    // query.sort({ "updatedAt": -1 });
    return query.lean().exec({ virtuals: true });
  } else {
    if (
      user &&
      user.strictlyAllowedReportTypes &&
      user.strictlyAllowedReportTypes.length
    ) {
      query.push({
        $match: { vertical: { $in: user.strictlyAllowedReportTypes } }
      });
    }
    if (reportId) {
      query.push({
        $match: { _id: new mongoose.Types.ObjectId(reportId) }
      });
    } else if (reportName) {
      query.push({
        $match: {
          searching_title: { $regex: `\\b${reportName}\\b`, $options: "i" },
          approved: true
        }
      });
    }
    if (user && user.reportIds && user.reportIds.length) {
      query.push({
        $match: { _id: { $in: user.reportIds } }
      });
    }
    if (vertical) {
      query.push({
        $match: { vertical: vertical }
      });
    }

    if (!utilities.isEmpty(selectKeys)) {
      let selKeysArr = [];
      selKeysArr = selectKeys.split(",");
      [
        "title",
        "vertical",
        "category",
        "owner",
        "status",
        "approver",
        "tocList",
        "title_prefix"
      ].forEach(item => {
        selKeysArr.push(item);
      });
    }
    if (!utilities.isEmpty(companyId)) {
      query.push({
        $match: { "cp.company_id": companyId }
      });
    }
    const queryPromise = Reports.aggregate(query);
    return queryPromise;
  }
};

const getReportByKeys = (reportId, keyString = "") => {
  const query = Reports.find();
  query.where({ _id: mongoose.Types.ObjectId(reportId) });
  if (keyString) {
    query.select(keyString);
  }
  return query.lean().exec({ virtuals: true });
};

const searchReportByName = (searchString, keyString) => {
  try {
    console.log("searchString", searchString)
    console.log("keyString", keyString)
    const query = Reports.find();
    query.select(keyString);
    query.where({
      searching_title: {
        $regex: `\\b${getReportNameString(searchString)}\\b`,
        $options: "i"
      }
    });
    return query.lean().exec({ virtuals: true });
  } catch (e) {
    console.log(e);
  }
};

const getReportsByKeys = (keys = "", ids = []) => {
  const query = Reports.find();
  const idsArray = [];
  if (ids && ids.length) {
    ids.forEach(item => {
      idsArray.push(mongoose.Types.ObjectId(item));
    });
    query.where({ _id: { $in: idsArray } });
  }
  if (keys) {
    query.select(keys.split(","));
  }
  return query.lean().exec({ virtuals: true });
};

const fetchReportForCompany = function(selectKeys, companyId, companyName) {
  const query = Reports.find();

  const selectObj = {
    _id: 1,
    title: 1,
    status: 1,
    "cp.$": 1
  };

  if (!utilities.isEmpty(companyId)) {
    query.where({ "cp.company_id": companyId });
  }

  if (!utilities.isEmpty(companyName)) {
    query.where({ "cp.company_name": { $regex: companyName, $options: "i" } });
  }

  query.select(selectObj);

  query.sort({ updatedAt: -1 });

  return query.lean().exec({ virtuals: true });
};

// add new custom module for a report
const addNewCustomModule = async function(reportId, moduleObj) {
  const moduleObjNew = { ...moduleObj, ...{ is_main_section_only: true } };
  const updateRes = await Reports.update(
    { _id: mongoose.Types.ObjectId(reportId) },
    { $push: { tocList: moduleObjNew } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return updateRes;
};

const getSectionDetailsFromSectionKey = function(reportId, sectionKey) {
  let matchQuery = {};
  console.log("reportId", reportId);
  console.log("sectionKey", sectionKey);
  matchQuery = { ...matchQuery, ...{ _id: mongoose.Types.ObjectId(reportId) } };
  matchQuery = {
    ...matchQuery,
    ...{
      "tocList.section_key": {
        $regex: new RegExp(`.*${sectionKey.toLowerCase()}.*`, "i")
      }
    }
  };

  const selectObj = { "tocList.$": 1 };
  const query = Reports.findOne(matchQuery, selectObj);

  return query.lean().exec({ virtuals: true });
};

// company profile methods - report specific data
// add company list information in the report

const addCompanyProfileData = async function(reportId, companyList) {
  const queryPromise = await Reports.update(
    { _id: mongoose.Types.ObjectId(reportId) },
    { cp: companyList },
    { new: true, setDefaultsOnInsert: true }
  );

  return queryPromise;
};

const addNewCompanyData = async function(reportId, company) {
  let cpData = Reports.update(
    { _id: mongoose.Types.ObjectId(reportId) },
    {
      $push: {
        cp: {
          company_id: company.company_id,
          company_name: company.company_name
        }
      }
    }
  );
  return cpData;
};

const deleteReportCompany = async function(reportId, company) {
  let cpData = Reports.update(
    { _id: mongoose.Types.ObjectId(reportId) },
    {
      $pull: {
        cp: {
          company_id: company.company_id,
          company_name: company.company_name
        }
      }
    }
  );
  return cpData;
};

const addReportOverlapsData = function(data, reportId) {
  return Reports.updateOne(
    { _id: mongoose.Types.ObjectId(reportId) },
    {
      $set: { overlaps: data.overlaps, youtubeContents: data.youtubeContents }
    },
    { new: true, setDefaultsOnInsert: true }
  );
};

const addCompanyOverview = function(coData, cpID, reportId) {
  // console.log(JSON.stringify(arr));
  const queryPromise = Reports.update(
    {
      _id: mongoose.Types.ObjectId(reportId),
      "cp.company_id": mongoose.Types.ObjectId(cpID)
    },
    {
      $set: { "cp.$.company_overview": coData }
    },
    { new: true, setDefaultsOnInsert: true }
  );
  return queryPromise;
};

const addSwotAnalysis = function(saData, cpID, reportId) {
  // console.log(JSON.stringify(arr));

  const queryPromise = Reports.update(
    {
      _id: mongoose.Types.ObjectId(reportId),
      "cp.company_id": mongoose.Types.ObjectId(cpID)
    },
    {
      $set: { "cp.$.swot_analysis": saData }
    },
    { new: true, setDefaultsOnInsert: true }
  );

  return queryPromise;
};

const addKeyDevelopments = function(kdData, cpID, reportId) {
  const queryPromise = Reports.update(
    {
      _id: mongoose.Types.ObjectId(reportId),
      "cp.company_id": mongoose.Types.ObjectId(cpID)
    },
    {
      $set: { "cp.$.key_development": kdData }
    },
    { new: true, setDefaultsOnInsert: true }
  );

  return queryPromise;
};

const addStrategyInfo = function(stData, cpID, reportId) {
  const queryPromise = Reports.update(
    {
      _id: mongoose.Types.ObjectId(reportId),
      "cp.company_id": mongoose.Types.ObjectId(cpID)
    },
    {
      $set: { "cp.$.strategy": stData }
    },
    { new: true, setDefaultsOnInsert: true }
  );

  return queryPromise;
};

const getCompanyReportDataByKey = async function(reportId, companyId, key) {
  console.log("reportId", reportId);
  const query = Reports.find(
    { _id: mongoose.Types.ObjectId(reportId) },
    "title"
  );
  console.log("query", query);
  if (!utilities.isEmpty(companyId) && !utilities.isEmpty(key)) {
    query.findOne(
      { "cp.company_id": companyId },
      "cp._id cp.company_name cp.company_id cp." + key
    );
  }
  console.log("quwery", query);
  return query.lean().exec({ virtuals: true });
};

const getReportMenuItems = function(reportId) {
  const reportData = Reports.findOne({
    _id: mongoose.Types.ObjectId(reportId)
  });
  return reportData;
};

const getReportCompleteData = function(id) {
  const reportData = Reports.findOne({ _id: mongoose.Types.ObjectId(id) });
  return reportData;
};
const getFilteredReports = function(domain) {
  const reportData = Reports.find({ vertical: domain });
  return reportData;
};

const addReportStatus = function(data, id) {
  const queryPromise = Reports.updateOne(
    { _id: mongoose.Types.ObjectId(id) },
    { status: data },
    { upsert: true }
  );
  return queryPromise;
};
const getReportStatus = function(id) {
  const queryPromise = Reports.findOne({
    _id: mongoose.Types.ObjectId(id)
  }).select("status");
  return queryPromise;
};

const updateReportStatus = function(data, id) {
  const queryPromise = Reports.updateMany(
    {
      _id: mongoose.Types.ObjectId(id),
      "status.main_section_id": data.section_id
    },
    { $set: { "status.$.status": data.status } }
  );
  return queryPromise;
};

const getMeChartsByTitles = function(str) {
  // Split the string by commas to get individual titles
  const titles = str.split(',');

  // Decode URL-encoded characters in titles
  const decodedTitles = titles.map(title => decodeURIComponent(title.trim()));

  // Create case-insensitive regex terms for each title
  const regexTerms = decodedTitles.map(title => new RegExp(title, 'i'));

  const query = Reports.find();
  query.where({ "titles.title": { $in: regexTerms } });
  query.select("titles _id title");
  // query.sort({ "updatedAt": -1 });
  return query.lean().exec({ virtuals: true });
};


const getMeChartsCount = function() {
  const query = Reports.aggregate([
    {
      $match: {
        $or: [
          {
            titles: {
              $exists: true,
              $ne: null
            }
          },
          {
            "me.data": {
              $exists: true,
              $ne: null
            }
          }
        ],
        $and: [
          {
            approved: true
          }
        ]
      }
    },
    {
      $group: {
        _id: {
          titles: "$titles",
          data: "$me.data.key"
        },
        reportId: { $first: "$_id" },
        title: { $first: "$title" }
      }
    }
  ]);
  return query;
};

const getMeChartsTitlesById = function(id) {
  const query = Reports.find();
  query.where({ _id: mongoose.Types.ObjectId(id) });
  query.select("titles _id title");
  return query.lean().exec({ virtuals: true });
};

const getRelatedReportReports = async function(reportId) {
  const query = Reports.find({ _id: mongoose.Types.ObjectId(reportId) });
  if (!utilities.isEmpty(reportId)) {
    query.findOne({ "overlaps.section_name": "Report" }, { "overlaps.$.1": 1 });
  }
  return query.lean().exec({ virtuals: true });
};

const addTitles = function(id, data) {
  const queryPromise = Reports.updateOne(
    { _id: mongoose.Types.ObjectId(id) },
    { titles: data },
    { upsert: true }
  );
  return queryPromise;
};

const getContentByKey = (reportId, metaKey) => {
  let matchQuery = {};
  matchQuery = { ...matchQuery, ...{ _id: mongoose.Types.ObjectId(reportId) } };
  matchQuery = {
    ...matchQuery,
    ...{
      "toc.meta_info.section_key": { $regex: new RegExp(`.*${metaKey}.*`, "i") }
    }
  };
  const selectObj = { "toc.$.1": 1 };
  const query = Reports.findOne(matchQuery, selectObj);
  return query.lean().exec({});
};

const getContentByName = (reportId, metaName) => {
  let matchQuery = {};
  matchQuery = { ...matchQuery, ...{ _id: mongoose.Types.ObjectId(reportId) } };
  matchQuery = {
    ...matchQuery,
    ...{
      "toc.meta_info.section_value": {
        $regex: new RegExp(`.*${metaName}.*`, "i")
      }
    }
  };
  const selectObj = { "toc.$.1": 1 };
  const query = Reports.findOne(matchQuery, selectObj);
  return query.lean().exec({});
};
const getContentBySectionName = (reportId, sectionName) => {
  let matchQuery = {};
  matchQuery = { ...matchQuery, ...{ _id: mongoose.Types.ObjectId(reportId) } };
  matchQuery = {
    ...matchQuery,
    ...{ "toc.section_name": { $regex: new RegExp(`.*${sectionName}.*`, "i") } }
  };
  const selectObj = { "toc.$.1": 1 };
  const query = Reports.findOne(matchQuery, selectObj);
  return query.lean().exec({});
};
const titlePrefix = (reportId, prefix) => {
  return Reports.updateOne(
    { _id: mongoose.Types.ObjectId(reportId) },
    { title_prefix: prefix.title_prefix },
    { upsert: true }
  );
};

const setReportModuleSequence = (data, reportId) => {
  console.log("tocList", data);
  return Reports.updateOne(
    { _id: mongoose.Types.ObjectId(reportId) },
    { tocList: data },
    { upsert: true }
  );
};

const setPdfReport = (reportId, link) => {
  return Reports.updateOne(
    { _id: mongoose.Types.ObjectId(reportId) },
    { pdfLink: link, isPdf: true },
    { upsert: true }
  );
};

const addPdfReport = (title, link) => {
  let reportObj = new Reports({
    title: title,
    pdfLink: link,
    isAnalytics: false,
    isPdf: true
  });
  reportObj = reportObj.save();
  return reportObj;
};

const readCSV = (req, res, next) => {
  console.log("Read CSV");
  fs.readFile("./uploads/report_data3.json", (err, jsonString) => {
    try {
      console.log("1");
      if (err) {
        console.log("File read failed:", err);
        return res.send(err);
      }
      jsonString = JSON.parse(jsonString);
      let reportTitles = [];
      jsonString.forEach(item => {
        if (!reportTitles.includes(item["Report Title"])) {
          reportTitles.push(item["Report Title"]);
        }
      });
      let reportsData = [];
      let pdfDomains = [];
      reportTitles.forEach(item => {
        let tempReports = _.filter(jsonString, ["Report Title", item]);
        let obj = {
          title: item,
          isAnalytics: false,
          approved: true,
          owner: req.user._id,
          vertical: dataConstants.REPORT_CATEGORY.DEFAULT
        };
        tempReports.forEach(r => {
          if (r.Link.endsWith(".docx")) {
            obj.isDoc = true;
            obj.docLink = r.Link;
          } else if (r.Link.endsWith(".pdf")) {
            obj.isPdf = true;
            obj.pdfLink = r.Link;
          } else if (r.Link.endsWith(".xlsx")) {
            obj.isExcel = true;
            obj.excelLink = r.Link;
          }
        });
        let url = "";
        if (obj.docLink) {
          url = obj.docLink;
        } else if (obj.pdfLink) {
          url = obj.pdfLink;
        } else if (obj.excelLink) {
          url = obj.excelLink;
        }
        if (url) {
          let domains = [
            "AND",
            "CnM",
            "Auto",
            "AGRI",
            "EnP",
            "IAE",
            "CFnB",
            "PCM",
            "ICT",
            "HC",
            "Automotive",
            "CNM",
            "SEM",
            "CFNB",
            "ENP",
            "AUTOMOTIVE",
            "PCM",
            "ICT"
          ];
          let d = url.split("/")[7];
          if (!pdfDomains.includes(d)) {
            pdfDomains.push(d);
          }
          if (!domains.includes(d)) {
            console.log("===>", d);
            console.log("url===>", url);
            console.log("\n\n");
          }
          obj.vertical = d
            ? getVertical(d)
            : dataConstants.REPORT_CATEGORY.DEFAULT;
        }
        reportsData.push(obj);
      });
      console.log("pdfDomains", pdfDomains);
      reportsData.forEach(item => {
        const query = { title: item.title };
        const update = { $set: { ...item } };
        const options = { upsert: true };
        Reports.updateOne(query, update, options, (err, result) => {
          console.log("err", err + "  ->> result");
        });
      });
      return res.send({ Message: "Operation Completed" });
      // Reports.insertMany(reportsData, { ordered: false }, (err, result) => {
      //   console.log('errror', err);
      //   console.log('result', result);
      //   return res.send(result);
      // });
      // return reportObj;
      // return utilities.sendResponse(HTTPStatus.OK, jsonString, res);
      // console.log("File data:", jsonString);
    } catch (e) {
      console.log(e);
      return res.status(500).send(e);
    }
  });
};

const getVertical = domain => {
  if (domain == "AND") {
    return "AnD";
  } else if (domain == "CnM" || domain == "CNM") {
    return "CNM";
  } else if (
    ["EnP", "IAE", "CFnB", "CFNB", "ENP", "AGRI", "PCM", "ICT"].includes(domain)
  ) {
    return domain;
  } else if (domain == "HC") {
    return "Healthcare";
  } else if (
    domain == "Automotive" ||
    domain == "Auto" ||
    domain == "AUTOMOTIVE"
  ) {
    return "Auto";
  } else if (domain == "SEM") {
    return "SEMI";
  } else {
    console.log("domain=>", domain);
    return "default";
  }
};
const searchReport = (req, res, next) => {
  try {
    let q = req.query.q || null;
    Reports.find(
      {
        searching_title: {
          $regex: `\\b${getReportNameString(q)}\\b`,
          $options: "i"
        },
        approved: true
      },
      { title: 1, _id: 1 },
      (err, data) => {
        if (err) return res.status(500).send(err);
        return res.status(200).send({ data });
      }
    );
  } catch (e) {
    console.log("Error in search API", e);
    return res.status(500).send(e);
  }
};

const reportCharts = reportId => {
  const reportData = Reports.findOne({
    _id: mongoose.Types.ObjectId(reportId)
  });
  return reportData;
};

const getTitles = (req, res) => {
  const query = Reports.aggregate([
    {
      $match: {
        titles: {
          $exists: true,

          $ne: null
        }
      }
    },

    {
      $group: {
        _id: "$titles",
        reportId: { $first: "$_id" }
      }
    }
  ]);

  return query;
};

const getIndustryReport = reportId => {
  const reportData = Reports.findOne({
    _id: mongoose.Types.ObjectId(reportId.rid)
  });
  return reportData;
};

const getReportByTitle = title => {
  const reports = Reports.find({ searching_title: RegExp(title, 'i'), approved: true });
  return reports;
}

const getReportById = id => {
  console.log("id", id);
  const report = Reports.findOne({ _id:mongoose.Types.ObjectId(id) });
  return report;
}

module.exports = {
  Reports,
  getReports,
  reportCharts,
  getContentByKey,
  createReport,
  fetchReport,
  addNewCustomModule,
  getSectionDetailsFromSectionKey,
  getReportMenuItems,
  addCompanyProfileData,
  addCompanyOverview,
  addSwotAnalysis,
  addKeyDevelopments,
  addStrategyInfo,
  fetchReportForCompany,
  getCompanyReportDataByKey,
  deleteReportCompany,
  addNewCompanyData,
  addReportStatus,
  getReportStatus,
  updateReportStatus,
  getFilteredReports,
  getReportCompleteData,
  addTitles,
  getMeChartsByTitles,
  getMeChartsCount,
  addReportOverlapsData,
  getReportByKeys,
  getContentByName,
  getContentBySectionName,
  titlePrefix,
  getReportsByKeys,
  setReportModuleSequence,
  getMeChartsTitlesById,
  getRelatedReportReports,
  setPdfReport,
  addPdfReport,
  readCSV,
  searchReport,
  searchReportByName,
  getTitles,
  getIndustryReport,
  getReportByTitle,
  getReportById
};
