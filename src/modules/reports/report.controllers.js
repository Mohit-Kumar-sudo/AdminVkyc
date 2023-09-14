import * as _ from "lodash";
import HTTPStatus from "http-status";
import utilities from "../../utilities/utils";
import to from "../../utilities/to";
import reportModel from "./report.model";
import meModel from "../market_estimation/me.model";
import meService from "../market_estimation/me.service";
import textConstants from "../../config/text.template";
import dataConstants from "../../config/dataConstants";

const axios = require("axios");
const reportService = require("./report.service");

// export async function getReports(req, res) {
//   try {
//     const reports = (await reportService.getReports(req.user)) || {};
//     if (!utilities.isEmpty(reports.errors)) {
//       const errObj = reports.errors;
//       utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
//     } else {
//       utilities.sendResponse(HTTPStatus.OK, reports, res);
//     }
//   } catch (er) {
//     utilities.sendErrorResponse(
//       HTTPStatus.INTERNAL_SERVER_ERROR,
//       true,
//       er,
//       res
//     );
//   }
// }

// *************Obtimize GetReport Code**************** //
export async function getReports(req, res) {
  try {
    const reports = await reportService.getReports(req.user) || {};
    let allReports = [];
    for (const item of reports) {
        allReports.push(...item.reports)
    }
    res.status(HTTPStatus.OK).json({data:allReports, count:allReports.length});
  } catch (err) {
    res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({ error: err.message });
  }
}

export async function createReport(req, res) {
  try {
    const reportDetails = { ...req.body, ...{ owner: req.user.id } };

    const reportData = (await reportService.createReport(reportDetails)) || {};
    if (!utilities.isEmpty(reportData.errors)) {
      const errObj = reportData.errors;
      // const errObj = utilities.getErrorDetails(report.errors);
      utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
    } else {
      utilities.sendResponse(HTTPStatus.OK, reportData, res);
    }
  } catch (er) {
    utilities.sendErrorResponse(
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

    const reportData =
      (await reportService.fetchReport(
        reportId,
        reportName,
        vertical,
        selectKeys,
        companyId,
        "",
        req.user
      )) || {};

    if (!utilities.isEmpty(reportData.errors)) {
      const errObj = reportData.errors;
      utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
    } else {
      utilities.sendResponse(HTTPStatus.OK, reportData, res);
    }
  } catch (er) {
    utilities.sendErrorResponse(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      true,
      er,
      res
    );
  }
}

export async function addReportOverlapsData(req, res) {
  try {
    const reportId = req.params.rid || null;
    const result =
      (await reportModel.addReportOverlapsData(req.body, reportId)) || {};
    if (!utilities.isEmpty(result.errors)) {
      const errObj = result.errors;
      utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
    } else {
      utilities.sendResponse(HTTPStatus.OK, { result }, res);
    }
  } catch (er) {
    utilities.sendErrorResponse(
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
      utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
    } else {
      utilities.sendResponse(HTTPStatus.OK, { result }, res);
    }
  } catch (er) {
    utilities.sendErrorResponse(
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
      utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
    } else {
      utilities.sendResponse(HTTPStatus.OK, reportData, res);
    }
  } catch (er) {
    utilities.sendErrorResponse(
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
      utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
    } else {
      utilities.sendResponse(HTTPStatus.OK, reportData, res);
    }
  } catch (er) {
    utilities.sendErrorResponse(
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
      utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
    } else {
      utilities.sendResponse(HTTPStatus.OK, reportData, res);
    }
  } catch (er) {
    utilities.sendErrorResponse(
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
      utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
    } else {
      utilities.sendResponse(HTTPStatus.OK, reportData, res);
    }
  } catch (er) {
    utilities.sendErrorResponse(
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
      utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
    } else {
      utilities.sendResponse(HTTPStatus.OK, cpData, res);
    }
  } catch (er) {
    utilities.sendErrorResponse(
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
      utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
    } else {
      utilities.sendResponse(HTTPStatus.OK, cpData, res);
    }
  } catch (er) {
    utilities.sendErrorResponse(
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
      utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
    } else {
      utilities.sendResponse(HTTPStatus.OK, cpData, res);
    }
  } catch (er) {
    utilities.sendErrorResponse(
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
      utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
    } else {
      utilities.sendResponse(HTTPStatus.OK, cpData, res);
    }
  } catch (er) {
    utilities.sendErrorResponse(
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
      utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
    } else {
      utilities.sendResponse(HTTPStatus.OK, cpData, res);
    }
  } catch (er) {
    utilities.sendErrorResponse(
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
    utilities.sendErrorResponse(
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
      if (datas) utilities.sendResponse(HTTPStatus.OK, datas, res);
    } catch (er) {
      console.log(er);

      utilities.sendErrorResponse(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        true,
        er,
        res
      );
    }
  } else {
    utilities.sendResponse(HTTPStatus.OK, {}, res);
  }
}

export async function getReportStatus(req, res) {
  try {
    const reportId = req.params.rid;
    const data = (await reportService.getReportStatus(reportId)) || {};
    utilities.sendResponse(HTTPStatus.OK, data, res);
  } catch (er) {
    console.log(er);

    utilities.sendErrorResponse(
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
    utilities.sendResponse(HTTPStatus.OK, data, res);
  } catch (er) {
    console.log(er);

    utilities.sendErrorResponse(
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
      utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
    } else {
      utilities.sendResponse(HTTPStatus.OK, cpData, res);
    }
  } catch (er) {
    utilities.sendErrorResponse(
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
      utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
    } else {
      utilities.sendResponse(HTTPStatus.OK, data, res);
    }
  } catch (er) {
    utilities.sendErrorResponse(
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
      utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
    } else {
      utilities.sendResponse(HTTPStatus.OK, data, res);
    }
  } catch (er) {
    utilities.sendErrorResponse(
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
      utilities.sendErrorResponse(
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
      utilities.sendResponse(
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
    utilities.sendErrorResponse(
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
      utilities.sendErrorResponse(
        HTTPStatus.BAD_REQUEST,
        true,
        data.errors,
        res
      );
    } else {
      utilities.sendResponse(HTTPStatus.OK, data, res);
    }
  } catch (er) {
    utilities.sendErrorResponse(
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
      utilities.sendErrorResponse(
        HTTPStatus.BAD_REQUEST,
        true,
        data.errors,
        res
      );
    } else {
      utilities.sendResponse(HTTPStatus.OK, data, res);
    }
  } catch (er) {
    utilities.sendErrorResponse(
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
      utilities.sendErrorResponse(
        HTTPStatus.BAD_REQUEST,
        true,
        data.errors,
        res
      );
    } else {
      utilities.sendResponse(HTTPStatus.OK, data, res);
    }
  } catch (er) {
    utilities.sendErrorResponse(
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
      utilities.sendErrorResponse(
        HTTPStatus.BAD_REQUEST,
        true,
        data.errors,
        res
      );
    } else {
      utilities.sendResponse(HTTPStatus.OK, data, res);
    }
  } catch (er) {
    utilities.sendErrorResponse(
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
    utilities.sendErrorResponse(
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
      (await reportService.reportCharts(reportId, chartId, title, req)) || {};
    const newTitle = data.titles.filter(o => o.title === title);

    let viewKey;
    if (keyValue) {
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
      utilities.sendErrorResponse(
        HTTPStatus.BAD_REQUEST,
        true,
        data.errors,
        res
      );
    } else {
      utilities.sendResponse(HTTPStatus.OK, { viewData }, res);
    }
  } catch (er) {
    utilities.sendErrorResponse(
      HTTPStatus.INTERNAL_SERVER_ERROR,
      true,
      er,
      res
    );
  }
}

export async function searchReportByName(req, res) {
  try {
    const str = req.query.title || "";
    const keys = req.query.select || "title";
    const data =
      (await reportModel.searchReportByName(str, keys.split(",").join(" "))) ||
      {};
    res.status(200).send(data);
  } catch (er) {
    utilities.sendErrorResponse(
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
                    utilities.sendErrorResponse(
                      HTTPStatus.BAD_REQUEST,
                      true,
                      errObj,
                      res
                    );
                  } else {
                    utilities.sendResponse(HTTPStatus.OK, data, res);
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
    utilities.sendErrorResponse(
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
      utilities.sendErrorResponse(
        HTTPStatus.BAD_REQUEST,
        true,
        data.errors,
        res
      );
    } else {
      utilities.sendResponse(HTTPStatus.OK, data, res);
    }
  } catch (er) {
    utilities.sendErrorResponse(
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
      utilities.sendErrorResponse(
        HTTPStatus.BAD_REQUEST,
        true,
        data.errors,
        res
      );
    } else {
      utilities.sendResponse(HTTPStatus.OK, data, res);
    }
  } catch (er) {
    utilities.sendErrorResponse(
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
