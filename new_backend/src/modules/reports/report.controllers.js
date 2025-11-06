import * as _ from "lodash";
import HTTPStatus from "http-status";
import utilities from "../../utilities/utils";
import to from "../../utilities/to";
import reportModel from "./report.model";
import meModel from "../market_estimation/me.model";
import meService from "../market_estimation/me.service";
import dataConstants from "../../config/dataConstants";
const { getFromRedis, setToRedis } = require("../../config/redis");
import mongoose from "mongoose";

const axios = require("axios");
const reportService = require("./report.service");

export async function getReports(req, res) {
  try {
    const cacheKey = `getReports`;
    // const cachedData = await getFromRedis(cacheKey);
    // if (cachedData) {
    //   res
    //     .status(HTTPStatus.OK)
    //     .json({ data: cachedData, count: cachedData.length });
    //   return;
    // }
    const reports = await reportService.getReports(req.user);
    let allReports = [];
    for (const item of reports) {
      allReports.push(...item.reports);
    }
    // Store the fetched data in the Redis cache for future use
    await setToRedis(cacheKey, allReports);
    res
      .status(HTTPStatus.OK)
      .json({ data: allReports, count: allReports.length });
    return;
  } catch (err) {
    res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({ error: err.message });
    return;
  }
}

export async function createReport(req, res) {
  try {
    const reportDetails = { ...req.body, ...{ owner: req.user.id } };

    const reportData = (await reportService.createReport(reportDetails)) || {};
    if (!utilities.isEmpty(reportData.errors)) {
      const errObj = reportData.errors;
      // const errObj = utilities.getErrorDetails(report.errors);
      return utilities.sendErrorResponse(
        HTTPStatus.BAD_REQUEST,
        true,
        errObj,
        res
      );
    } else {
      return utilities.sendResponse(HTTPStatus.OK, reportData, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      true,
      er,
      res
    );
  }
}

export async function fetchReport(req, res) {
  try {
    const reportId = req.params.rid || null;
    const reportName = req.query.title || null;
    const vertical = req.query.vertical || null;
    const companyId = req.query.cid || null;
    const selectKeys = req.query.select || "";

    const cacheKey = `fetchReport-${reportId}-${reportName}-${vertical}-${companyId}-${selectKeys}`;

    // Check if the data is already cached in Redis
    const cachedData = await getFromRedis(cacheKey);

    if (cachedData) {
      console.log("Data found in Redis cache");
      // If data is found in the cache, use the cached data
      return res.status(200).json({ success: true, data: cachedData });
    } else {
      // If data is not found in the cache, fetch it from the service
      const reportData = await reportService.fetchReport(
        reportId,
        reportName,
        vertical,
        selectKeys,
        companyId,
        "",
        req.user
      );

      if (!utilities.isEmpty(reportData.errors)) {
        const errObj = reportData.errors;
        return res
          .status(400)
          .json({ success: false, error: "Bad Request", details: errObj });
      } else {
        // Store the fetched data in the Redis cache for future use
        await setToRedis(cacheKey, reportData);
        console.log("Data stored in Redis cache");
        // Return the fetched report data as a response
        return res.status(200).json({ success: true, data: reportData });
      }
    }
  } catch (er) {
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error", details: er });
  }
}

export async function fetchMe(req, res, next) {
  console.log("req.body", req.body); 

  try {
    let { reportName, vertical, selectKeys, companyId } = req.query;
    let { rid } = req.params;
    let user = req.user; 

    let query = { approved: true }; 

    if (rid) query._id = new mongoose.Types.ObjectId(rid);
    if (reportName)  query.where({
      searching_title: {
        $regex: new RegExp(reportName, "i")
      },
      approved: true
    });

    if (vertical) query.vertical = vertical;
    if (companyId) query["cp.company_id"] = companyId;
    
    if (user && user.strictlyAllowedReportTypes && user.strictlyAllowedReportTypes.length) {
      query.vertical = { $in: user.strictlyAllowedReportTypes };
    }
    
    if (user && user.reportIds && user.reportIds.length) {
      query._id = { $in: user.reportIds };
    }

    const reports = await reportModel.Reports.find(query).select("me").lean();

    if (!reports.length) {
      return res.json({ message: "No Data found" });
    }

    res.json({ data: reports });
  } catch (error) {
    next(error);
  }
};

export async function fetchCp(req, res, next) {
  console.log("req.body", req.body); 

  try {
    let { reportName, vertical, selectKeys, companyId } = req.query;
    let { rid } = req.params;
    let user = req.user; 

    let query = { approved: true }; 

    if (rid) query._id = new mongoose.Types.ObjectId(rid);
    if (reportName)  query.where({
      searching_title: {
        $regex: new RegExp(reportName, "i")
      },
      approved: true
    });
    if (vertical) query.vertical = vertical;
    if (companyId) query["cp.company_id"] = companyId;
    
    if (user && user.strictlyAllowedReportTypes && user.strictlyAllowedReportTypes.length) {
      query.vertical = { $in: user.strictlyAllowedReportTypes };
    }
    
    if (user && user.reportIds && user.reportIds.length) {
      query._id = { $in: user.reportIds };
    }

    const reports = await reportModel.Reports.find(query).select("title category vertical cp me.start_year me.end_year me.base_year overlaps owner tocList status title_prefix youtubeContents").lean();

    if (!reports.length) {
      return res.status(404).json({ message: "No reports found" });
    }

    res.json({ data: reports });
  } catch (error) {
    next(error);
  }
};

export async function fetchReportCp(req,res,next){
  console.log("req.body", req.body); // Fixed to log req.body instead of res
  try {
    const reportId = req.params.rid || null;
    const reportName = req.query.title || null;
    const vertical = req.query.vertical || null;
    const companyId = req.query.cid || null;
    const selectKeys = req.query.select || "";

    try {
      // Fetch report data from the database
      const query = reportModel.Reports.find();
      const selectObj = {
        _id: 1,
        title: 1,
        status: 1,
        "cp.$": 1,
      };

      if (!utilities.isEmpty(companyId)) {
        query.where({ "cp.company_id": companyId });
      }

      query.select(selectObj);
      query.sort({ updatedAt: -1 });

      const reportData = await query.lean().exec({ virtuals: true });

      console.log("reportData", reportData);

      if (!utilities.isEmpty(reportData.errors)) {
        return res.status(400).json({
          success: false,
          error: "Bad Request",
          details: reportData.errors,
        });
      }

      return res.status(200).json({ success: true, data: reportData });
    } catch (er) {
      console.error("Error in fetching report:", er);
      return res.status(500).json({
        success: false,
        error: "Internal Server Error",
        details: er.message,
      });
    }
  } catch (er) {
    next(er)
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      details: er.message,
    });
  }
};

export async function searchReport(req, res, next) {
  console.log("req.body", req.body); 
  try {
    let { reportName, vertical, selectKeys, companyId } = req.query;
    let { rid } = req.params;
    let user = req.user; 

    let query = { approved: true }; 

    if (rid) query._id = new mongoose.Types.ObjectId(rid);
    if (reportName) {query.searching_title = { $regex: new RegExp(reportName, "i") };}    
    if (vertical) query.vertical = vertical;
    if (companyId) query["cp.company_id"] = companyId;
    
    if (user && user.strictlyAllowedReportTypes && user.strictlyAllowedReportTypes.length) {
      query.vertical = { $in: user.strictlyAllowedReportTypes };
    }
    
    if (user && user.reportIds && user.reportIds.length) {
      query._id = { $in: user.reportIds };
    }

    const reports = await reportModel.Reports.find(query).select("title isAnalytics approved isExcel isPdf isDoc pdfLink excelLink docLink me").lean();

    if (!reports.length) {
      return res.status(404).json({ message: "No reports found" });
    }

    res.json({ data: reports });
  } catch (error) {
    next(error);
  }
};

export async function addReportOverlapsData(req, res) {
  try {
    const reportId = req.params.rid || null;
    const result =
      (await reportModel.addReportOverlapsData(req.body, reportId)) || {};
    if (!utilities.isEmpty(result.errors)) {
      const errObj = result.errors;
      return utilities.sendErrorResponse(
        HTTPStatus.BAD_REQUEST,
        true,
        errObj,
        res
      );
    } else {
      return utilities.sendResponse(HTTPStatus.OK, { result }, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      true,
      er,
      res
    );
  }
}

export async function setReportModuleSequence(req, res) {
  try {
    const reportId = req.params.rid || null;
    const result =
      (await reportModel.setReportModuleSequence(req.body, reportId)) || {};
    if (!utilities.isEmpty(result.errors)) {
      const errObj = result.errors;
      return utilities.sendErrorResponse(
        HTTPStatus.BAD_REQUEST,
        true,
        errObj,
        res
      );
    } else {
      return utilities.sendResponse(HTTPStatus.OK, { result }, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      true,
      er,
      res
    );
  }
}

// ad new custom module in report doc
export async function addNewCustomModule(req, res) {
  try {
    const moduleObj = req.body;
    const reportId = req.params["rid"];
    const reportData =
      (await reportService.addNewCustomModule(reportId, moduleObj)) || {};
    if (!utilities.isEmpty(reportData.errors)) {
      const errObj = reportData.errors;
      // const errObj = utilities.getErrorDetails(report.errors);
      return utilities.sendErrorResponse(
        HTTPStatus.BAD_REQUEST,
        true,
        errObj,
        res
      );
    } else {
      return utilities.sendResponse(HTTPStatus.OK, reportData, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      true,
      er,
      res
    );
  }
}

// add company profile data
export async function addCompanyProfileData(req, res) {
  try {
    const companyList = req.body;
    const reportId = req.params["rid"];

    const reportData =
      (await reportService.addCompanyProfileData(reportId, companyList)) || {};
    if (!utilities.isEmpty(reportData.errors)) {
      const errObj = reportData.errors;
      return utilities.sendErrorResponse(
        HTTPStatus.BAD_REQUEST,
        true,
        errObj,
        res
      );
    } else {
      return utilities.sendResponse(HTTPStatus.OK, reportData, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      true,
      er,
      res
    );
  }
}

// add company profile data
export async function addNewCompanyData(req, res) {
  try {
    const companyList = req.body;
    const reportId = req.params["rid"];

    const reportData =
      (await reportService.addNewCompanyData(reportId, companyList)) || {};
    if (!utilities.isEmpty(reportData.errors)) {
      const errObj = reportData.errors;
      return utilities.sendErrorResponse(
        HTTPStatus.BAD_REQUEST,
        true,
        errObj,
        res
      );
    } else {
      return utilities.sendResponse(HTTPStatus.OK, reportData, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      true,
      er,
      res
    );
  }
}

// add company profile data
export async function deleteReportCompany(req, res) {
  try {
    const company = req.body;
    const reportId = req.params["rid"];
    const reportData =
      (await reportService.deleteReportCompany(reportId, company)) || {};
    if (!utilities.isEmpty(reportData.errors)) {
      const errObj = reportData.errors;
      return utilities.sendErrorResponse(
        HTTPStatus.BAD_REQUEST,
        true,
        errObj,
        res
      );
    } else {
      return utilities.sendResponse(HTTPStatus.OK, reportData, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      true,
      er,
      res
    );
  }
}

// add company overview
export async function addCompanyOverview(req, res) {
  try {
    const reportId = req.params["rid"];
    const companyId = req.query["cid"];
    const coData = req.body;

    const cpData =
      (await reportService.addCompanyOverview(coData, companyId, reportId)) ||
      {};
    if (!utilities.isEmpty(cpData.errors)) {
      const errObj = cpData.errors;
      // const errObj = utilities.getErrorDetails(report.errors);
      return utilities.sendErrorResponse(
        HTTPStatus.BAD_REQUEST,
        true,
        errObj,
        res
      );
    } else {
      return utilities.sendResponse(HTTPStatus.OK, cpData, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      true,
      er,
      res
    );
  }
}

// get report company details by key
export async function getReportCompanyDetailsByKey(req, res) {
  try {
    const reportId = req.params["rid"];
    const companyId = req.query["cid"];
    const key = req.query["key"];
    const cpData =
      (await reportService.getReportCompanyDetailsByKeyService(
        companyId,
        reportId,
        key
      )) || {};
    if (!utilities.isEmpty(cpData.errors)) {
      const errObj = cpData.errors;
      return utilities.sendErrorResponse(
        HTTPStatus.BAD_REQUEST,
        true,
        errObj,
        res
      );
    } else {
      return utilities.sendResponse(HTTPStatus.OK, cpData, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      true,
      er,
      res
    );
  }
}

// add company swot analysis
export async function addSwotAnalysis(req, res) {
  try {
    const reportId = req.params["rid"];
    const companyId = req.query["cid"];
    const saData = req.body;

    const cpData =
      (await reportService.addSwotAnalysis(saData, companyId, reportId)) || {};
    if (!utilities.isEmpty(cpData.errors)) {
      const errObj = cpData.errors;
      // const errObj = utilities.getErrorDetails(report.errors);
      return utilities.sendErrorResponse(
        HTTPStatus.BAD_REQUEST,
        true,
        errObj,
        res
      );
    } else {
      return utilities.sendResponse(HTTPStatus.OK, cpData, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      true,
      er,
      res
    );
  }
}

// add company key developments
export async function addKeyDevelopments(req, res) {
  try {
    const reportId = req.params["rid"];
    const companyId = req.query["cid"];
    const kdData = req.body;

    const cpData =
      (await reportService.addKeyDevelopments(kdData, companyId, reportId)) ||
      {};
    if (!utilities.isEmpty(cpData.errors)) {
      const errObj = cpData.errors;
      // const errObj = utilities.getErrorDetails(report.errors);
      return utilities.sendErrorResponse(
        HTTPStatus.BAD_REQUEST,
        true,
        errObj,
        res
      );
    } else {
      return utilities.sendResponse(HTTPStatus.OK, cpData, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      true,
      er,
      res
    );
  }
}

// add company strategy info
export async function addStrategyInfo(req, res) {
  try {
    const reportId = req.params["rid"];
    const companyId = req.query["cid"];
    const stData = req.body;

    const cpData =
      (await reportService.addStrategyInfo(stData, companyId, reportId)) || {};
    if (!utilities.isEmpty(cpData.errors)) {
      const errObj = cpData.errors;
      // const errObj = utilities.getErrorDetails(report.errors);
      return utilities.sendErrorResponse(
        HTTPStatus.BAD_REQUEST,
        true,
        errObj,
        res
      );
    } else {
      return utilities.sendResponse(HTTPStatus.OK, cpData, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      true,
      er,
      res
    );
  }
}

export async function getReportCompleteData(req, res) {
  try {
    const data =
      (await reportService.getReportCompleteData(req.params.rid)) || {};
    await checkData(req, res, data);
  } catch (er) {
    return utilities.sendErrorResponse(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      true,
      er,
      res
    );
  }
}

async function checkData(req, res, data) {
  var statusArr = [];
  if (data.toc && data.toc.length) {
    var meIndex = _.find(data.tocList, { section_name: "MARKET ESTIMATION" });
    // console.log("data.me.geo_segment.region", data.me.geo_segment)
    // if (data.me.geo_segment.region.length) {
    if (data.me.geo_segment.length) {
      statusArr.push({
        main_section_id: meIndex.section_id,
        status: "started"
      });
    }
    data.toc.forEach(d => {
      if (d.content && d.content.length) {
        statusArr.push({
          main_section_id: d.main_section_id,
          status: "started"
        });
      }
    });
    if (statusArr && statusArr.length) {
      statusArr.forEach(d => {
        data.tocList.forEach(dd => {
          if (dd.section_id === d.main_section_id && d.status != "Finished") {
            d.status = "started";
          }
        });
      });
    }
  }
  var cpIndex = _.find(data.tocList, { section_name: "COMPANY PROFILES" });
  if (data.cp.length > 0) {
    statusArr.push({
      main_section_id: cpIndex.section_id,
      status: "started"
    });
  }
  statusArr = _.uniqBy(statusArr, function(e) {
    return e.main_section_id;
  });
  if (data && data.status.length) {
    statusArr.forEach(d => {
      data.status.forEach(dd => {
        if (d.main_section_id === dd.main_section_id) {
          d.status = dd.status;
        }
      });
    });
  }
  if (statusArr && statusArr.length) {
    // const updateStatus =
    try {
      const reportId = data._id;
      const datas =
        (await reportService.addReportStatus(statusArr, reportId)) || {};
      if (datas) return utilities.sendResponse(HTTPStatus.OK, datas, res);
    } catch (er) {
      console.log(er);

      return utilities.sendErrorResponse(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        true,
        er,
        res
      );
    }
  } else {
    return utilities.sendResponse(HTTPStatus.OK, {}, res);
  }
}

export async function getReportStatus(req, res) {
  try {
    const reportId = req.params.rid;
    const data = (await reportService.getReportStatus(reportId)) || {};
    return utilities.sendResponse(HTTPStatus.OK, data, res);
  } catch (er) {
    console.log(er);

    return utilities.sendErrorResponse(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      true,
      er,
      res
    );
  }
}

export async function updateReportStatus(req, res) {
  try {
    const reportId = req.params.rid;
    const statusData = req.body;
    const data =
      (await reportService.updateReportStatus(statusData, reportId)) || {};
    return utilities.sendResponse(HTTPStatus.OK, data, res);
  } catch (er) {
    console.log(er);

    return utilities.sendErrorResponse(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      true,
      er,
      res
    );
  }
}

export async function getFilteredReports(req, res) {
  try {
    const domain = req.params["vertical"];
    const cpData = (await reportService.getFilteredReports(domain)) || {};
    if (!utilities.isEmpty(cpData.errors)) {
      const errObj = cpData.errors;
      // const errObj = utilities.getErrorDetails(report.errors);
      return utilities.sendErrorResponse(
        HTTPStatus.BAD_REQUEST,
        true,
        errObj,
        res
      );
    } else {
      return utilities.sendResponse(HTTPStatus.OK, cpData, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      true,
      er,
      res
    );
  }
}

export async function getReportCpData(req, res) {
  try {
    const data =
      (await reportService.getReportCompleteData(req.params.rid)) || {};
    if (!utilities.isEmpty(data.errors)) {
      const errObj = data.errors;
      // const errObj = utilities.getErrorDetails(report.errors);
      return utilities.sendErrorResponse(
        HTTPStatus.BAD_REQUEST,
        true,
        errObj,
        res
      );
    } else {
      return utilities.sendResponse(HTTPStatus.OK, data, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      true,
      er,
      res
    );
  }
}

export async function getReportsByKeys(req, res) {
  try {
    const data = (await reportModel.getReportsByKeys(req.query.keys)) || {};
    if (!utilities.isEmpty(data.errors)) {
      const errObj = data.errors;
      return utilities.sendErrorResponse(
        HTTPStatus.BAD_REQUEST,
        true,
        errObj,
        res
      );
    } else {
      return utilities.sendResponse(HTTPStatus.OK, data, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      true,
      er,
      res
    );
  }
}

export async function getReportChart(req, res) {
  try {
    const data = (await reportModel.getReportMenuItems(req.params.rid)) || {};
    if (!utilities.isEmpty(data.errors)) {
      return utilities.sendErrorResponse(
        HTTPStatus.BAD_REQUEST,
        true,
        data.errors,
        res
      );
    } else {
      const years = _.range(data.me.start_year, data.me.end_year + 1);
      let response = { labels: years };
      const regions = _.map(data.me.geo_segment, "region");
      let datasets = [];
      const tempData = _.find(data.me.data, [`key`, "geography_parent_value"]);
      response.metric = tempData.metric;
      regions.forEach(item => {
        let t = { label: item, data: [] };
        const tValue = _.find(tempData.value, ["geography_parent", item]);
        years.forEach(y => {
          t.data.push(tValue[y]);
        });
        datasets.push(t);
      });
      response.datasets = datasets;
      return utilities.sendResponse(
        HTTPStatus.OK,
        {
          title: `${data.title_prefix} ${data.title} Market [${
            data.me.start_year
          } - ${data.me.end_year}] by Region`,
          controls: {
            years,
            regions: data.me.geo_segment,
            segments: data.me.segment
          },
          chartData: response
        },
        res
      );
    }
  } catch (er) {
    return utilities.sendErrorResponse(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      true,
      er,
      res
    );
  }
}

export async function setPdfReport(req, res) {
  try {
    const data =
      (await reportModel.setPdfReport(req.params.rid, req.query.link)) || {};
    if (!utilities.isEmpty(data.errors)) {
      return utilities.sendErrorResponse(
        HTTPStatus.BAD_REQUEST,
        true,
        data.errors,
        res
      );
    } else {
      return utilities.sendResponse(HTTPStatus.OK, data, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      true,
      er,
      res
    );
  }
}

export async function addPdfReport(req, res) {
  try {
    const data =
      (await reportModel.addPdfReport(req.query.title, req.query.link)) || {};
    if (!utilities.isEmpty(data.errors)) {
      return utilities.sendErrorResponse(
        HTTPStatus.BAD_REQUEST,
        true,
        data.errors,
        res
      );
    } else {
      return utilities.sendResponse(HTTPStatus.OK, data, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      true,
      er,
      res
    );
  }
}

export async function getRelatedReportReports(req, res) {
  try {
    const data =
      (await reportModel.getRelatedReportReports(req.params.rid)) || {};
    if (!utilities.isEmpty(data.errors)) {
      return utilities.sendErrorResponse(
        HTTPStatus.BAD_REQUEST,
        true,
        data.errors,
        res
      );
    } else {
      return utilities.sendResponse(HTTPStatus.OK, data, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      true,
      er,
      res
    );
  }
}

export async function getSuggestedReportCharts(req, res) {
  try {
    console.log(req.params.rid);
    const data =
      (await reportModel.getMeChartsTitlesById(req.params.rid)) || {};
    if (!utilities.isEmpty(data.errors)) {
      return utilities.sendErrorResponse(
        HTTPStatus.BAD_REQUEST,
        true,
        data.errors,
        res
      );
    } else {
      return utilities.sendResponse(HTTPStatus.OK, data, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      true,
      er,
      res
    );
  }
}

export async function getReportByKeys(req, res) {
  try {
    const rid = req.params.rid;
    const keys = req.query.select || "";
    const data =
      (await reportModel.getReportByKeys(rid, keys.split(",").join(" "))) || {};
    res.status(200).send(data);
  } catch (er) {
    return utilities.sendErrorResponse(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      true,
      er,
      res
    );
  }
}

export async function getChartsReport(req, res) {
  try {
    const reportId = req.query.id;
    const chartId = req.query.chartId;
    const title = req.query.title;
    const keyValue = req.query.key;
    const data =
      await reportService.reportCharts(reportId, chartId, title, req) || {};
    const newTitle = data.titles.filter(o => o.title === title);

    let viewKey;
    if (!keyValue) {
      viewKey = "KEYVALUE";
    } else {
      viewKey = newTitle[0].key;
    }
    let viewData = null;
    try {
      switch (viewKey) {
        case dataConstants.ME_VIEWS.MARKET_BY_REGION:
          viewData = await getByRegion(reportId, chartId, newTitle[0], data);
          break;
        case dataConstants.ME_VIEWS.MARKET_BY_SEGMENT:
          viewData = await getBySegment(reportId, chartId, newTitle[0], data);
          break;
        case dataConstants.ME_VIEWS.KEYVALUE:
          viewData = await getByKeyValue(reportId, keyValue, title, data);
          break;
        default:
          console.error("View Key is invalid or missing!");
          break;
      }
    } catch (error) {
      console.error("Error: Market By Get Charts Report:" + error);
      return (viewData.errors = error.message);
    }
    if (!utilities.isEmpty(data.errors)) {
      return utilities.sendErrorResponse(
        HTTPStatus.BAD_REQUEST,
        true,
        data.errors,
        res
      );
    } else {
      return utilities.sendResponse(HTTPStatus.OK, { viewData }, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      true,
      er,
      res
    );
  }
}

export async function searchReportByName(req, res) {
  try {
    // console.log("request", req.query)
    const str = req.query.q || req.query.title || "";
    const keys = req.query.select || "title";
    console.log('str', str)
    const data =
      (await reportModel.searchReportByName(str, keys.split(",").join(" "))) ||
      {};
    res.status(200).send(data);
  } catch (er) {
    return utilities.sendErrorResponse(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      true,
      er,
      res
    );
  }
}

async function segmentsTitles(segData, geoData, reportData) {
  let regSegTitle = "";
  const segArray = [];
  const geoArray = [];
  segData.forEach(d => {
    if (d.pid === "1") {
      let baseTitle =
        "Global " +
        reportData.reportName +
        " market [" +
        reportData.base_year +
        "] by " +
        d.name;
      let title =
        "Global " +
        reportData.reportName +
        " market [" +
        reportData.start_year +
        "-" +
        reportData.end_year +
        "] by " +
        d.name;
      segArray.push(
        {
          title: baseTitle,
          type: "PIE",
          id: d.id,
          key: "MARKET_BY_SEGMENT"
        },
        {
          title: title,
          type: "BAR",
          id: d.id,
          key: "MARKET_BY_SEGMENT"
        }
      );
    }
  });
  geoData.forEach(d => {
    let baseTitle =
      "Global " +
      reportData.reportName +
      " market [" +
      reportData.base_year +
      "] by " +
      d.region;
    let title =
      "Global " +
      reportData.reportName +
      " market [" +
      reportData.start_year +
      "-" +
      reportData.end_year +
      "] by " +
      d.region;

    segData.forEach(dd => {
      if (dd.pid === "1") {
        regSegTitle =
          "Global " +
          reportData.reportName +
          " market [" +
          reportData.start_year +
          "-" +
          reportData.end_year +
          "] " +
          d.region +
          " by " +
          dd.name;
        geoArray.push({
          title: regSegTitle,
          type: "BAR",
          id: d._id,
          key: "MARKET_BY_REGION"
        });
      }
    });
    geoArray.push(
      {
        title: baseTitle,
        type: "PIE",
        id: d._id,
        key: "MARKET_BY_REGION"
      },
      {
        title: title,
        type: "BAR",
        id: d.id,
        key: "MARKET_BY_REGION"
      }
    );
  });
  if (geoArray.length && segArray.length) {
    // let finalArr = geoArray.concat(segArray);
    let finalArr = _.union(geoArray, segArray);
    return finalArr;
  }
}

export async function generateTitles(req, res) {
  const reportId = req.params.rid;
  const modelData = await to(
    reportModel.fetchReport(reportId, "", "", "me", "")
  );
  if (modelData.length) {
    const meData = modelData[0].me;
    const reportData = {
      start_year: meData.start_year,
      end_year: meData.end_year,
      base_year: meData.base_year,
      reportName: modelData[0].title
    };
    const titleData = segmentsTitles(
      meData.segment,
      meData.geo_segment,
      reportData
    );
    if (titleData) addTitles(req, res, titleData, reportId);
  }
}

export async function addTitles(req, res, titleData, reportId) {
  try {
    if (titleData) {
      titleData
        .then(d => {
          if (d.length) {
            reportService
              .addTitles(reportId, d)
              .then(data => {
                if (data) {
                  if (!utilities.isEmpty(data.errors)) {
                    const errObj = data.errors;
                    return utilities.sendErrorResponse(
                      HTTPStatus.BAD_REQUEST,
                      true,
                      errObj,
                      res
                    );
                  } else {
                    return utilities.sendResponse(HTTPStatus.OK, data, res);
                  }
                }
              })
              .catch(err => {
                res.json({ err });
              });
          }
        })
        .catch(err => {
          res.json({ err });
        });
    }
  } catch (er) {
    return utilities.sendErrorResponse(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      true,
      er,
      res
    );
  }
}

export async function titlePrefix(req, res) {
  try {
    const reportId = req.params.rid;
    const prefix = req.body;
    const data = (await reportService.titlePrefix(reportId, prefix)) || {};
    if (!utilities.isEmpty(data.errors)) {
      return utilities.sendErrorResponse(
        HTTPStatus.BAD_REQUEST,
        true,
        data.errors,
        res
      );
    } else {
      return utilities.sendResponse(HTTPStatus.OK, data, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      true,
      er,
      res
    );
  }
}

export async function getPremiumReport(req, res) {
  try {
    const reportId = req.query;
    const data = (await reportService.getPremiumReport(reportId)) || {};
    if (!utilities.isEmpty(data.errors)) {
      return utilities.sendErrorResponse(
        HTTPStatus.BAD_REQUEST,
        true,
        data.errors,
        res
      );
    } else {
      return utilities.sendResponse(HTTPStatus.OK, data, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      true,
      er,
      res
    );
  }
}

export async function getByRegion(reportId, chartId, title, data) {
  let resData = {};
  try {
    resData = await axios.get(
      `http://ec2-3-20-213-233.us-east-2.compute.amazonaws.com:6969/api/v1/me/${reportId}/views?key=${
        title.key
      }&value=${chartId}`
    );
  } catch (error) {
    console.log("error", error);
  }
  const years = _.range(data.me.start_year, data.me.end_year + 1);
  let response = { labels: years };
  let country = [];
  let segment = [];
  let segments = [];
  let datasets = [];
  const textRegex = /\b(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*|[A-Z]+\b)(?:\s+(?:of|the|and|Saint)\s+)?(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*|[A-Z]+\b)?(?:\s*\([A-Z][a-z]+\))?\b/g;
  let texts = title.title.match(textRegex);
  if (title.title.includes("type")) {
    texts.push("type");
  }
  data.me.segment.forEach(o => {
    texts.forEach(j => {
      if (j === o.name) {
        segment.push(o);
      }
    });
  });
  if (chartId) {
    let newResult = data.me.geo_segment;
    data.me.geo_segment.forEach(j => {
      if (chartId === j._id) {
        country.push(j);
      }
    });
  }
  if (!country.length) {
    const countryRegex = /\b(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*|[A-Z]+\b)(?:\s+(?:of|the|and|Saint)\s+)?(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*|[A-Z]+\b)?(?:\s*\([A-Z][a-z]+\))?\b/g;
    let countries = title.title.match(countryRegex);
    data.me.geo_segment.forEach(j => {
      countries.forEach(o => {
        if (o === j.region) {
          country.push(j);
        }
      });
    });
  }
  if (segment.length) {
    data.me.segment.forEach(o => {
      segment.forEach(j => {
        if (o.pid === j.id) {
          segments.push({
            id: o.id,
            name: o.name,
            key: o.name
              .replace(/&/g, "and")
              .replace(/\(/g, "")
              .replace(/\)/g, "")
              .replace(/[\W_]+/g, "_")
              .toLowerCase()
          });
        }
      });
    });
    let keyName = segment[0].name.replace(/[\W_]+/g, "_").toLowerCase();
    country = country[0].region.replace(/[\W_]+/g, "_").toLowerCase();
    let searchName = keyName + "_" + country;
    keyName = keyName + "_" + country + "_value";
    let outputData = resData.data.data.filter(o => {
      if (o.key === keyName) {
        return o;
      }
    });
    const synopsis = [];
    outputData.forEach(o => {
      if (o.key === keyName) {
        synopsis.push({
          key: o.key,
          region_name: o.region_name,
          text: o.text
        });
      }
    });
    const tempData = _.find(outputData, [`key`, keyName]);
    response.metric = tempData.metric;
    segments.forEach(item => {
      let t = { label: item.name, data: [] };
      const tValue = _.find(tempData.value, [searchName, item.key]);
      years.forEach(y => {
        t.data.push(tValue[y]);
      });
      datasets.push(t);
    });
    response.datasets = datasets;
    return {
      title: title,
      controls: {
        years,
        regions: data.me.geo_segment,
        segments: data.me.segment
      },
      chartData: response,
      description: synopsis
    };
  } else {
    country = country[0].region ? country[0].region : "";
    let regionName = country.toLowerCase();
    let synopsis = [];
    resData.data.data.forEach(o => {
      if (o.region_name === regionName) {
        synopsis.push({
          key: o.key,
          region_name: o.region_name,
          text: o.text
        });
      }
    });
    let regions = _.find(data.me.geo_segment, [`region`, country]);
    let newRegion = [];
    newRegion.push(regions.region);
    if (newRegion) {
      const tempData = _.find(data.me.data, [`key`, "geography_parent_value"]);
      response.metric = tempData.metric;
      newRegion.forEach(item => {
        let t = { label: item, data: [] };
        const tValue = _.find(tempData.value, ["geography_parent", item]);
        years.forEach(y => {
          t.data.push(tValue[y]);
        });
        datasets.push(t);
      });
    }
    let regionData = regions.region.replace(/[\W_]+/g, "_").toLowerCase();
    const value = "_value";
    const tempData = _.find(data.me.data, [`key`, regionData + value]);
    response.metric = tempData.metric;
    regions.countries.forEach(item => {
      let t = { label: item.name, data: [] };
      const tValue = _.find(tempData.value, [regionData, item.name]);
      years.forEach(y => {
        t.data.push(tValue[y]);
      });
      datasets.push(t);
    });
    response.datasets = datasets;
    return {
      title: title,
      controls: {
        years,
        regions: data.me.geo_segment,
        segments: data.me.segment
      },
      chartData: response,
      text: tempData.text,
      description: synopsis
    };
  }
}

export async function getBySegment(reportId, chartId, title, data) {
  let resData = {};
  let result = [];
  try {
    resData = await axios.get(
      `http://ec2-3-20-213-233.us-east-2.compute.amazonaws.com:6969/api/v1/me/${reportId}/views?key=${
        title.key
      }&value=${chartId}`
    );
    result.push(resData.data.data[0]);
  } catch (error) {
    console.log("error", error);
  }
  let synopsis = [];
  result.forEach(o => {
    synopsis.push({
      key: o.key,
      title: o.title,
      grid_key: o.grid_key,
      text: o.text
    });
  });
  const years = _.range(data.me.start_year, data.me.end_year + 1);
  let response = { labels: years };
  response.metric = resData.data.data[0].metric;
  let datasets = [];
  const segment = data.me.segment.filter(o => {
    return o.name;
  });
  result.forEach(item => {
    const keyName = item.name.replace(/[\W_]+/g, "_").toLowerCase();
    const value = "_parent";

    let segment = [];
    console.log("chartId", chartId);
    data.me.segment.map(o => {
      if (o.pid === chartId) {
        segment.push(o.name);
      }
    });
    let table = {};
    segment.forEach(seg => {
      table = { label: seg, data: [] };
      let segName = seg
        .replace(/&/g, "and")
        .replace(/\(/g, "")
        .replace(/\)/g, "")
        .replace(/[\W_]+/g, "_")
        .toLowerCase();
      const tValue = _.find(item.value, [keyName + value, segName]);
      years.forEach(y => {
        table.data.push(tValue[y]);
      });
      datasets.push(table);
    });
  });
  response.datasets = datasets;
  return {
    title: title,
    controls: {
      years,
      segment: data.me.segment
    },
    chartData: response,
    description: synopsis
  };
}

export async function getByKeyValue(reportId, keyvalue, title, data) {
  let viewKey = "COMMON_TEMPLATE";
  let gridKeys = [];
  gridKeys.push(keyvalue);
  let resData = {};
  let textData = {};
  try {
    resData = (await meModel.getMEGridDataForViews(reportId, gridKeys)) || [];
    if (resData) {
      textData =
        (await meService.getTextForViews(
          reportId,
          resData[0].gridData,
          viewKey
        )) || [];
    }
  } catch (error) {
    console.log("error", error);
  }
  const years = _.range(data.me.start_year, data.me.end_year + 1);
  let response = {};
  let synopsis = [];
  let values = [];
  let datasets = [];
  let keyName = [];
  resData[0].gridData.forEach(o => {
    synopsis.push({
      key: o.key,
      title: o.title,
      grid_key: o.grid_key,
      text: o.text
    });
    values.push(o.value);
  });
  response.metric = resData[0].gridData[0].metric;
  keyvalue = keyvalue.replace("_value", "");
  for (let i = 0; i < resData[0].gridData[0].value.length; i++) {
    keyName.push(resData[0].gridData[0].value[i][keyvalue]);
  }
  let slice = keyName.splice(-1);
  if (keyName[0] === undefined) {
    keyvalue = keyvalue.replace("geography_", "").replace("_parent", "");
    let keyName = [];
    for (let i = 0; i < resData[0].gridData[0].value.length; i++) {
      keyName.push(resData[0].gridData[0].value[i][keyvalue]);
    }
    let slice = keyName.splice(-1);
    keyName.forEach(item => {
      let name = item.replace(/_/g, " ");
      let t = { label: name, data: [] };
      const tValue = _.find(resData[0].gridData[0].value, [keyvalue, item]);
      years.forEach(y => {
        t.data.push(tValue[y]);
      });
      datasets.push(t);
    });
  } else {
    keyName.forEach(item => {
      let name = item.replace(/_/g, " ");
      let t = { label: name, data: [] };
      const tValue = _.find(resData[0].gridData[0].value, [keyvalue, item]);
      years.forEach(y => {
        t.data.push(tValue[y]);
      });
      datasets.push(t);
    });
  }
  response.datasets = datasets;
  return {
    title: {
      title: title,
      reportTitle: data.title,
      type: "Bar"
    },
    controls: {
      years,
      regions: data.me.geo_segment,
      segments: data.me.segment
    },
    chartData: response,
    text: textData.text,
    description: synopsis
  };
}

export async function getIndustryReport(req, res) {
  try {
    const reportId = req.params;
    const data = (await reportService.getIndustryReport(reportId)) || {};

    const leftMenuData = filterMenuItems(data);

    const tabsContent = leftMenuData
      .map(o => {
        if (o.label) {
          for (const toc of data.toc) {
            if (o.label == toc.section_name) {
              return {
                label: o.label,
                data: toc.content[0].data.content.slice(0, 2000)
              };
            }
          }
        }
      })
      .filter(Boolean);

    const tabsData = leftMenuData
      .map(o => {
        if (o.label == "Market Factor Analysis") {
          let content = [];
          for (const item of o.items) {
            for (const toc of data.toc) {
              const regex = new RegExp(item.label, "i");

              if (regex.test(toc.section_name)) {
                content.push({
                  label: item.label,
                  data: toc.content[0].data.length
                    ? toc.content[0].data[0].info.slice(0, 2000)
                    : toc.content[0].data.content.slice(0, 2000)
                });
              }
            }
          }
          if (content.length > 0) {
            return {
              label: o.label,
              items: content
            };
          }
        }
        return null;
      })
      .filter(Boolean);

    const reportData = {
      id: data.id,
      title_prefix: data.title_prefix,
      title_suffix: data.title_suffix,
      title: data.title,
      vertical: data.vertical,
      searching_title: data.searching_title,
      tabsData: [...tabsContent, ...tabsData]
    };

    const newData = reportData;

    if (!utilities.isEmpty(data.errors)) {
      return utilities.sendErrorResponse(
        HTTPStatus.BAD_REQUEST,
        true,
        data.errors,
        res
      );
    } else {
      return utilities.sendResponse(HTTPStatus.OK, newData, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      true,
      er,
      res
    );
  }
}

function filterMenuItems(reportData) {
  const finalMenuData = [];

  // Analytics
  // if (reportData.me.data) {
  finalMenuData.push({ label: "Analytics" });
  // }

  // Market Breakup
  if (reportData.me && reportData.me.segment && reportData.me.segment.length) {
    finalMenuData.push({ label: "Market Breakup" });
  }

  // Executive Summary
  if (reportData.toc) {
    // let executiveSummaryData = _.find(reportData.toc, ['section_name', "EXECUTIVE SUMMARY"]);
    let executiveSummaryData = _.find(reportData.toc, ["section_id", "2"]);
    if (
      executiveSummaryData &&
      executiveSummaryData.content &&
      executiveSummaryData.content.length
    ) {
      finalMenuData.push({
        label: "Executive Summary"
      });
    }
  }

  // Market Introduction
  let marketIntroductionSubMenus = [];
  if (reportData.toc) {
    let mIdata = _.find(reportData.toc, [
      "meta_info.section_value",
      "Definition"
    ]);
    if (mIdata) {
      marketIntroductionSubMenus.push({
        label: "Definition"
      });
    }
    mIdata = _.find(reportData.toc, [
      "meta_info.section_value",
      "Scope of the study"
    ]);
    if (mIdata) {
      marketIntroductionSubMenus.push({
        label: "Scope of the study"
      });
    }

    mIdata = _.find(reportData.toc, [
      "meta_info.section_value",
      "List of assumptions"
    ]);
    if (mIdata) {
      marketIntroductionSubMenus.push({
        label: "List of assumptions"
      });
    }

    mIdata = _.find(reportData.toc, ["meta_info.section_key", "structure"]);
    if (mIdata) {
      marketIntroductionSubMenus.push({
        label: "Market Structure"
      });
    }
    mIdata = _.find(reportData.toc, ["meta_info.section_key", "takeways"]);
    if (mIdata) {
      marketIntroductionSubMenus.push({
        label: "Key takeaways"
      });
    }
    mIdata = _.find(reportData.toc, [
      "meta_info.section_value",
      "Macro Factor Indicators Analysis"
    ]);
    if (mIdata) {
      marketIntroductionSubMenus.push({
        label: "Macro Factor Indicators Analysis"
      });
    }
    mIdata = _.find(reportData.toc, ["meta_info.section_key", "insights"]);
    if (mIdata) {
      marketIntroductionSubMenus.push({
        label: "Market Insights"
      });
    }

    if (marketIntroductionSubMenus && marketIntroductionSubMenus.length) {
      finalMenuData.push({
        label: "Market Introduction",
        items: marketIntroductionSubMenus
      });
    }
  }

  // Market Estimation By Segments
  if (
    reportData.me &&
    reportData.me.segment &&
    reportData.me.segment.length &&
    reportData.me.data
  ) {
    const menuObj = {
      label: "Market Estimation By Segments"
    };
    const segmentItems = _.filter(reportData.me.segment, ["pid", "1"]);
    if (segmentItems.length) {
      menuObj.segmentItems = segmentItems;
    }
    finalMenuData.push(menuObj);
  }

  // Market Estimation By Region
  if (reportData.me && reportData.me.geo_segment && reportData.me.data) {
    const menuObj = {
      label: "Market Estimation By Region"
    };
    const segmentItems = reportData.me.geo_segment;
    if (segmentItems) {
      menuObj.segmentItems = segmentItems;
    }
    finalMenuData.push(menuObj);
  }

  const marketDynamicsSubMenus = [];
  const marketFactorAnalysisSubMenus = [];
  if (reportData.toc) {
    // Market Dynamics Sub Menus
    // Drivers
    let driversData = _.find(reportData.toc, ["section_name", "Drivers"]);
    if (driversData && driversData.content && driversData.content.length) {
      marketDynamicsSubMenus.push({
        label: "Drivers"
      });
    }

    // Restraints
    let restraintsData = _.find(reportData.toc, ["section_name", "Restraints"]);
    if (
      restraintsData &&
      restraintsData.content &&
      restraintsData.content.length
    ) {
      marketDynamicsSubMenus.push({
        label: "Restraints"
      });
    }

    // Opportunities
    let opportunitiesData = _.find(reportData.toc, [
      "section_name",
      "Opportunities"
    ]);
    if (
      opportunitiesData &&
      opportunitiesData.content &&
      opportunitiesData.content.length
    ) {
      marketDynamicsSubMenus.push({
        label: "Opportunities"
      });
    }

    // Challenges
    let challengesData = _.find(reportData.toc, ["section_name", "Challenges"]);
    if (
      challengesData &&
      challengesData.content &&
      challengesData.content.length
    ) {
      marketDynamicsSubMenus.push({
        label: "Challenges"
      });
    }

    // Trends
    let trendsData = _.find(reportData.toc, ["section_name", "Trends"]);
    if (trendsData && trendsData.content && trendsData.content.length) {
      marketDynamicsSubMenus.push({ label: "Trends" });
    }

    // Market Factor Analysis Sub Menus
    // Supply chain analysis
    let supplyChainAnalysisData = _.find(reportData.toc, [
      "section_name",
      "Suuply / Value Chain Analysis"
    ]);
    if (
      supplyChainAnalysisData &&
      supplyChainAnalysisData.content &&
      supplyChainAnalysisData.content.length
    ) {
      const label =
        supplyChainAnalysisData.meta &&
        supplyChainAnalysisData.meta.chain_type &&
        supplyChainAnalysisData.meta.chain_type === "VALUE CHAIN ANALYSIS"
          ? "Value Chain Analysis"
          : "Supply Chain Analysis";
      marketFactorAnalysisSubMenus.push({
        label: label
      });
    }

    //  Porter’s 5 forces
    let porters5forcesData = _.find(reportData.toc, [
      "section_name",
      "Porters"
    ]);
    if (
      porters5forcesData &&
      porters5forcesData.content &&
      porters5forcesData.content.length
    ) {
      marketFactorAnalysisSubMenus.push({
        label: "Porters"
      });
    }
  }

  // Market Dynamics parent menu
  // let marketDynamicsData = _.find(reportData.toc, ['meta_info.section_key', 'introduction']);
  // if (marketDynamicsData && marketDynamicsData.content && marketDynamicsData.content.length) {
  finalMenuData.push({
    label: "Market Dynamics",
    items: marketDynamicsSubMenus
  });
  // }

  if (marketFactorAnalysisSubMenus.length) {
    finalMenuData.push({
      label: "Market Factor Analysis",
      items: marketFactorAnalysisSubMenus
    });
  }

  // Top Players
  if (reportData.cp && reportData.cp.length) {
    const menuObj = {
      label: "Top Players",
      segmentItems: []
    };
    const segmentItems = reportData.cp;
    reportData.cp.forEach(item => {
      menuObj.segmentItems.push({
        id: item.company_id,
        name: item.company_name
      });
    });
    finalMenuData.push(menuObj);
  }

  let competitiveLandscapeSubMenus = [];
  if (reportData.toc) {
    // Competitive Overview
    let competitiveOverviewData = _.find(reportData.toc, [
      "meta_info.section_key",
      "overview"
    ]);
    if (
      competitiveOverviewData &&
      competitiveOverviewData.content &&
      competitiveOverviewData.content.length
    ) {
      competitiveLandscapeSubMenus.push({
        label: "Competitive Overview"
      });
    }

    // Market Share/Strategy/Ranking Analysis
    let marketShareStrategyRankingAnalysisData = _.find(reportData.toc, [
      "meta_info.section_key",
      "marketAnalysis"
    ]);
    if (
      marketShareStrategyRankingAnalysisData &&
      marketShareStrategyRankingAnalysisData.content &&
      marketShareStrategyRankingAnalysisData.content.length
    ) {
      competitiveLandscapeSubMenus.push({
        label: "Market Share/Strategy/Ranking Analysis"
      });
    }

    // Key developments and growth strategies
    let keyDevelopmentsAndGrowthStrategiesData = _.find(reportData.toc, [
      "meta_info.section_key",
      "devAndGrowthStrategies"
    ]);
    if (
      keyDevelopmentsAndGrowthStrategiesData &&
      keyDevelopmentsAndGrowthStrategiesData.content &&
      keyDevelopmentsAndGrowthStrategiesData.content.length
    ) {
      competitiveLandscapeSubMenus.push({
        label: "Key developments and growth strategies"
      });
    }

    // Product/Service Development
    let newProductServiceDevelopmentData = _.find(reportData.toc, [
      "meta_info.section_key",
      "newDevelopment"
    ]);
    if (
      newProductServiceDevelopmentData &&
      newProductServiceDevelopmentData.content &&
      newProductServiceDevelopmentData.content.length
    ) {
      competitiveLandscapeSubMenus.push({
        label: "New Product/Service Development"
      });
    }

    // Market Share/Strategy/Ranking Analysis
    let mergerAndAcquisitionData = _.find(reportData.toc, [
      "meta_info.section_key",
      "mergerAndAquisition"
    ]);
    if (
      mergerAndAcquisitionData &&
      mergerAndAcquisitionData.content &&
      mergerAndAcquisitionData.content.length
    ) {
      competitiveLandscapeSubMenus.push({
        label: "Merger & Acquisition"
      });
    }

    // Joint Ventures
    let jointVenturesData = _.find(reportData.toc, [
      "meta_info.section_key",
      "jointVenture"
    ]);
    if (
      jointVenturesData &&
      jointVenturesData.content &&
      jointVenturesData.content.length
    ) {
      competitiveLandscapeSubMenus.push({
        label: "Joint Ventures"
      });
    }
    // Competitor dashboard
    let competitorDashboardData = _.find(reportData.toc, [
      "meta_info.section_key",
      "dashboard"
    ]);
    if (
      competitorDashboardData &&
      competitorDashboardData.content &&
      competitorDashboardData.content.length
    ) {
      competitiveLandscapeSubMenus.push({
        label: "Competitor dashboard"
      });
    }

    // Competitive benchmarking
    let competitiveBenchmarkingData = _.find(reportData.toc, [
      "meta_info.section_key",
      "benchMarking"
    ]);
    if (
      competitiveBenchmarkingData &&
      competitiveBenchmarkingData.content &&
      competitiveBenchmarkingData.content.length
    ) {
      competitiveLandscapeSubMenus.push({
        label: "Competitive benchmarking"
      });
    }
    if (competitiveLandscapeSubMenus.length)
      finalMenuData.push({
        label: "Competitive Landscape",
        items: competitiveLandscapeSubMenus
      });

    let parentMarketAnalysisSubMenus = [];
    // Competitive benchmarking
    let automobileProductionDataData = _.find(reportData.toc, [
      "meta_info.section_key",
      "productionData"
    ]);
    if (
      automobileProductionDataData &&
      automobileProductionDataData.content &&
      automobileProductionDataData.content.length
    ) {
      parentMarketAnalysisSubMenus.push({
        label: "Automobile Production Data"
      });
    }

    // Competitive benchmarking
    let automobileSalesDataData = _.find(reportData.toc, [
      "meta_info.section_key",
      "salesData"
    ]);
    if (
      automobileSalesDataData &&
      automobileProductionDataData.content &&
      automobileSalesDataData.content.length
    ) {
      parentMarketAnalysisSubMenus.push({
        label: "Automobile Sales Data"
      });
    }
    if (parentMarketAnalysisSubMenus.length) {
      finalMenuData.push({
        label: "Parent Market Analysis",
        items: parentMarketAnalysisSubMenus
      });
    }

    // Pricing Raw Material Scenario
    let pricingRawMaterialScenarioMenus = [];
    let pricingRawMaterialScenarioData = _.find(reportData.toc, [
      "meta_info.section_value",
      "Pricing analysis"
    ]);
    if (
      pricingRawMaterialScenarioData &&
      pricingRawMaterialScenarioData &&
      pricingRawMaterialScenarioData.content.length
    ) {
      pricingRawMaterialScenarioMenus.push({
        label: "Pricing Analysis"
      });
    }

    let pricingRawMaterialScenarioData1 = _.find(reportData.toc, [
      "meta_info.section_value",
      "Raw material scenario"
    ]);
    if (
      pricingRawMaterialScenarioData1 &&
      pricingRawMaterialScenarioData1.content &&
      pricingRawMaterialScenarioData1.content.length
    ) {
      pricingRawMaterialScenarioMenus.push({
        label: "Raw material scenario"
      });
    }

    if (pricingRawMaterialScenarioMenus.length) {
      finalMenuData.push({
        label: "Pricing Raw Material Scenario",
        items: pricingRawMaterialScenarioMenus
      });
    }

    // Trade Landscape
    const tradeLandscapeData = _.find(reportData.toc, [
      "section_name",
      "Trade Landscape"
    ]);
    if (
      tradeLandscapeData &&
      tradeLandscapeData.content &&
      tradeLandscapeData.content.length
    ) {
      finalMenuData.push({
        label: "Trade Landscape"
      });
    }

    // Production Outlook
    let productionOutlookMenus = [];
    let productionOutlookData = _.find(reportData.toc, [
      "meta_info.section_value",
      "Production capacities"
    ]);
    if (
      productionOutlookData &&
      productionOutlookData.content &&
      productionOutlookData.content.length
    ) {
      productionOutlookMenus.push({
        label: "Production capacities"
      });
    }

    productionOutlookData = _.find(reportData.toc, [
      "meta_info.section_value",
      "Production cost breakup"
    ]);
    if (
      productionOutlookData &&
      productionOutlookData.content &&
      productionOutlookData.content.length
    ) {
      productionOutlookMenus.push({
        label: "Production cost breakup"
      });
    }

    productionOutlookData = _.find(reportData.toc, [
      "meta_info.section_value",
      "Production share"
    ]);
    if (
      productionOutlookData &&
      productionOutlookData.content &&
      productionOutlookData.content.length
    ) {
      productionOutlookMenus.push({
        label: "Production share"
      });
    }

    if (productionOutlookMenus.length) {
      finalMenuData.push({
        label: "Production Outlook",
        items: productionOutlookMenus
      });
    }

    // Pipeline Analysis
    let pipelineAnalysisMenus = [];
    let pipelineAnalysisData = _.find(reportData.toc, [
      "meta_info.section_value",
      "Clinical Trial Phases"
    ]);
    if (
      pipelineAnalysisData &&
      pipelineAnalysisData.content &&
      pipelineAnalysisData.content.length
    ) {
      pipelineAnalysisMenus.push({
        label: "Clinical Trial Phases"
      });
    }

    pipelineAnalysisData = _.find(reportData.toc, [
      "meta_info.section_value",
      "Product Development"
    ]);
    if (
      pipelineAnalysisData &&
      pipelineAnalysisData.content &&
      pipelineAnalysisData.content.length
    ) {
      pipelineAnalysisMenus.push({
        label: "Product Development"
      });
    }

    pipelineAnalysisData = _.find(reportData.toc, [
      "meta_info.section_value",
      "Strategic Initiatives for Clinical Trials by Company"
    ]);
    if (
      pipelineAnalysisData &&
      pipelineAnalysisData.content &&
      pipelineAnalysisData.content.length
    ) {
      pipelineAnalysisMenus.push({
        label: "Strategic Initiatives for Clinical Trials by Company"
      });
    }

    if (pipelineAnalysisMenus.length) {
      finalMenuData.push({
        label: "Pipeline Analysis",
        items: pipelineAnalysisMenus
      });
    }

    if (reportData.tocList) {
      const otherModules = _.filter(reportData.tocList, [
        "urlpattern",
        "other-module"
      ]);
      otherModules.forEach(oM => {
        if (
          oM.section_name !== "RESEARCH METHODOLOGY" &&
          oM.section_name !== "Research Methodology"
        ) {
          const data = _.find(reportData.toc, [
            "section_id",
            oM.section_id.toString()
          ]);
          if (data && data.content) {
            finalMenuData.push({
              label: oM.section_name,
              sectionId: oM.section_id,
              mainSectionId: oM.main_section_id
            });
          }
        }
      });
    }
  }
  return finalMenuData;
}

export async function getReportByTitle(req, res) {
  try {
    const reportName = req.params.title || null;
    console.log("reportName", reportName);
    const data = (await reportService.getReportByTitle(reportName)) || {};
    if (!utilities.isEmpty(data.errors)) {
      return utilities.sendErrorResponse(
        HTTPStatus.BAD_REQUEST,
        true,
        data.errors,
        res
      );
    } else {
      return utilities.sendResponse(HTTPStatus.OK, data, res);
    }
  } catch (er) {
    return utilities.sendErrorResponse(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      true,
      er,
      res
    );
  }
}
