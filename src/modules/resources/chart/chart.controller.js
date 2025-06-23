import HTTPStatus from "http-status";
import utilities from "../../../utilities/utils";
import reportModel from "../../reports/report.model";
import * as _ from "lodash";

const chartService = require("./chart.service");

export async function getChartData(req, res) {
  try {
    let reportId = null;
    if (req.params["rid"]) {
      // path variable data
      reportId = req.params["rid"];
    }
    const chartName = req.query["q"];
    const chartData =
      (await chartService.getChartData(reportId, chartName)) || {};
    const meChartsData = await reportModel.getMeChartsByTitles(chartName);

    if (!utilities.isEmpty(chartData.errors)) {
      const errObj = chartData.errors;
      utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
    } else {
      utilities.sendResponse(HTTPStatus.OK, { chartData, meChartsData }, res);
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

export async function getChartCount(req, res) {
  try {
    const meChartsData = await reportModel.getMeChartsCount();
    let count = 0;
    for (const item of meChartsData) {
      if (Array.isArray(item._id.titles)) {
        item._id.titles = item._id.titles.map((o) => {
         return {
           title: o.title,
           type: o.type,
           id: o.id,
           key: o.key,
           reportTitle: item.title
         }
        })
        count += item._id.titles.length ? item._id.titles.length : 0;
      }
      if (Array.isArray(item._id.data)) {
        item._id.data = item._id.data.filter(o => {
          if (o.includes("value") && !o.includes("factor")) {
            count += 1;
            return o;
          }
        });
        item._id.data = item._id.data.map(o => {
          let titles = o.split("_").join(" ");
          titles = titles.replace(/(^\w|\s\w)/g, m => m.toUpperCase());
          return {
            key: o,
            title: titles,
            type:"Bar",
            reportTitle: item.title
          };
        });
      }
    }

    let chartTitles = meChartsData.map(o => {
      if (Array.isArray(o._id.titles) && Array.isArray(o._id.data)) {
        return {
          titles: [...o._id.titles, ...o._id.data],
          reportId: o.reportId
        };
      } else if (Array.isArray(o._id.titles)) {
        return {
          titles: [...o._id.titles],
          reportId: o.reportId
        };
      } else if (Array.isArray(o._id.data)) {
        return {
          titles: [...o._id.data],
          reportId: o.reportId
        };
      }
    });
    if (!utilities.isEmpty(meChartsData.errors)) {
      const errObj = meChartsData.errors;
      utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
    } else {
      utilities.sendResponse(HTTPStatus.OK, { count, chartTitles }, res);
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

export async function getTitles(req, res){
  try {
      let titles = await reportModel.getTitles();
      titles = titles.map(o => {
        return {
          titles: o._id,
          reportId:o.reportId
        }
      })

   if (!utilities.isEmpty(titles.errors)) {
      const errObj = titles.errors;
      utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
    } else {
      utilities.sendResponse(HTTPStatus.OK, titles, res);
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
