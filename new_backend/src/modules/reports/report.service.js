import reportModel from "./report.model";
import utilities from "../../utilities/utils";
import * as _ from 'lodash';
import HTTPStatus from 'http-status';
import to from "../../utilities/to";
import func from "joi/lib/types/func";

const axios = require("axios");

async function createReport(reportDetails) {
  let reportData = {};
  try {
    reportData = await to(reportModel.createReport(reportDetails));
    return reportData;
  } catch (er) {
    return (reportData.errors = er);
  }
}

async function getReports(user) {
  try {
    return await reportModel.getReports(user);
  } catch (err) {
    throw err;
  }
}

// async function fetchReport(
//   reportId,
//   reportName,
//   vertical,
//   selectKeys,
//   companyId,
//   companyName,
//   user
// ) {
//   let reportData = {};
//   let newData = {};
//   try {
//     if (utilities.isEmpty(companyId) && utilities.isEmpty(companyName)) {
//       console.log('reportId ======>', reportId)
//       reportData = await to(
//         reportModel.fetchReport(
//           reportId,
//           reportName,
//           vertical,
//           selectKeys,
//           companyId,
//           user
//         )
//       );
//       console.log("reportData ============>", reportData);
//     } else {
//       reportData = await to(
//         reportModel.fetchReportForCompany(selectKeys, companyId, companyName)
//       );
//     }
//     if (reportData && reportData.length) {
//       reportData.forEach(report => {
//         // eslint-disable-next-line no-param-reassign
//         report.title = `${report.title_prefix ? report.title_prefix : ""} ${
//           report.title
//         } `;
//       });
//       try {
//         newData = await axios.get(
//           `https://www.marketresearchfuture.com/platform-data?access_key=e4e98249d561da9&report_title=${reportName}`
//         );
//         if (newData) {
//           newData = newData.data[0].searchreports.map(o => {
//             return {
//               id: o[0],
//               title: o[1]
//             };
//           });
//         }
//         reportData.push(...newData);
//       } catch (error) {
//         console.error(error);
//       }
//     } else {
//       try {
//         newData = await axios.get(
//           `https://www.marketresearchfuture.com/platform-data?access_key=e4e98249d561da9&report_title=${reportName}`
//         );
//         if (newData) {
//           reportData = newData.data[0].searchreports.map(o => {
//             return {
//               id: o[0],

//               title: o[1]
//             };
//           });
//         }
//       } catch (error) {
//         console.error(error);
//       }
//     }
//     console.log("reportData", reportData);
//     return reportData;
//   } catch (er) {
//     console.error("Error in fetching report: error: " + er);

//     return (reportData.errors = er.message);
//   }
// }

async function fetchReport(
  reportId,
  reportName,
  vertical,
  selectKeys,
  companyId,
  companyName,
  user
) {
  let reportData = {};
        let newData = {};
        try {
          if (utilities.isEmpty(companyId) && utilities.isEmpty(companyName)) {
            console.log('reportId ======>', reportId)
            reportData = await to(
                reportModel.fetchReport(
                reportId,
                reportName,
                vertical,
                selectKeys,
                companyId,
                user
              )
            );
            console.log("reportData ============>", reportData);
          } 
          if (reportData && reportData.length) {
            reportData.forEach(report => {
              // eslint-disable-next-line no-param-reassign
              report.title = `${report.title_prefix ? report.title_prefix : ""} ${
                report.title
              } `;
            });
            try {
              newData = await axios.get(
                `https://www.marketresearchfuture.com/platform-data?access_key=e4e98249d561da9&report_title=${reportName}`
              );
              if (newData) {
                newData = newData.data[0].searchreports.map(o => {
                  return {
                    id: o[0],
                    title: o[1]
                  };
                });
              }
              reportData.push(...newData);
            } catch (error) {
              console.error(error);
            }
          } else {
            try {
              newData = await axios.get(
                `https://www.marketresearchfuture.com/platform-data?access_key=e4e98249d561da9&report_title=${reportName}`
              );
              if (newData) {
                reportData = newData.data[0].searchreports.map(o => {
                  return {
                    id: o[0],
      
                    title: o[1]
                  };
                });
              }
            } catch (error) {
              console.error(error);
            }
          }
          console.log("reportData", reportData);
          return reportData;
        } catch (er) {
          console.error("Error in fetching report: error: " + er);
      
          return (reportData.errors = er.message);
        }
}

const addNewCustomModule = async function(reportId, moduleObj) {
  let modData = {};

  try {
    modData = await to(reportModel.addNewCustomModule(reportId, moduleObj));

    return modData;
  } catch (er) {
    return (modData.errors = er);
  }
};

async function addCompanyProfileData(reportId, companyList) {
  let reportData = {};

  try {
    reportData = await to(
      reportModel.addCompanyProfileData(reportId, companyList)
    );

    if (!reportData.errors)
      reportData = utilities.formUpdateQueryResults(reportData);

    return reportData;
  } catch (er) {
    console.error(
      `Exception in adding company profile data for report (${reportId}). \n ` +
        er
    );

    return (reportData.errors = er.message);
  }
}

async function addNewCompanyData(reportId, companyList) {
  let reportData = {};

  try {
    reportData = await to(reportModel.addNewCompanyData(reportId, companyList));

    if (!reportData.errors)
      reportData = utilities.formUpdateQueryResults(reportData);

    return reportData;
  } catch (er) {
    console.error(
      `Exception in adding company profile data for report (${reportId}). \n ` +
        er
    );

    return (reportData.errors = er.message);
  }
}

async function deleteReportCompany(reportId, company) {
  let reportData = {};

  try {
    reportData = await to(reportModel.deleteReportCompany(reportId, company));

    if (!reportData.errors)
      reportData = utilities.formUpdateQueryResults(reportData);

    return reportData;
  } catch (er) {
    console.error(
      `Exception in adding company profile data for report (${reportId}). \n ` +
        er
    );

    return (reportData.errors = er.message);
  }
}

// company methods - report specific data

async function addCompanyOverview(coData, cpId, reportId) {
  let resData = {};

  try {
    resData = await to(reportModel.addCompanyOverview(coData, cpId, reportId));

    if (!resData.errors) resData = utilities.formUpdateQueryResults(resData);

    return resData;
  } catch (er) {
    console.error(
      `Exception in  adding company overview data for company (${cpId}) and report (${reportId}) : ${er}`
    );

    return (resData.errors = er.message);
  }
}

async function addSwotAnalysis(saData, cpId, reportId) {
  let resData = {};

  try {
    resData = await to(reportModel.addSwotAnalysis(saData, cpId, reportId));

    if (!resData.errors) resData = utilities.formUpdateQueryResults(resData);

    return resData;
  } catch (er) {
    console.error(
      `Exception in  adding SWOT Analysis data for company (${cpId}) and report (${reportId}) : ${er}`
    );

    return (resData.errors = er.message);
  }
}

async function addKeyDevelopments(kdData, cpId, reportId) {
  let resData = {};

  try {
    resData = await to(reportModel.addKeyDevelopments(kdData, cpId, reportId));

    if (!resData.errors) resData = utilities.formUpdateQueryResults(resData);

    return resData;
  } catch (er) {
    console.error(
      `Exception in  adding Key Developments data for company (${cpId}) and report (${reportId}) : ${er}`
    );

    return (resData.errors = er.message);
  }
}

async function addStrategyInfo(stData, cpId, reportId) {
  let resData = {};

  try {
    resData = await to(reportModel.addStrategyInfo(stData, cpId, reportId));

    if (!resData.errors) resData = utilities.formUpdateQueryResults(resData);

    return resData;
  } catch (er) {
    console.error(
      `Exception in  adding company overview data for company (${cpId}) and report (${reportId}) : ${er}`
    );

    return (resData.errors = er.message);
  }
}

async function getReportCompanyDetailsByKeyService(cpId, reportId, key) {
  let resData = {};

  try {
    resData = await to(
      reportModel.getCompanyReportDataByKey(reportId, cpId, key)
    );

    return resData;
  } catch (er) {
    console.error(
      `Exception in  adding company overview data for company (${cpId}) and report (${reportId}) : ${er}`
    );

    return (resData.errors = er.message);
  }
}

async function getReportCompleteData(id) {
  let resData = {};

  try {
    resData = await to(reportModel.getReportCompleteData(id));
    return resData;
  } catch (er) {
    console.error(`Exception in  getting report data. \n : ${er}`);

    return (resData.errors = er.message);
  }
}

async function addReportStatus(data, id) {
  let resData = {};

  try {
    resData = await to(reportModel.addReportStatus(data, id));

    return resData;
  } catch (er) {
    console.error(
      `Exception in  adding or updating data in daily intra day stocks. \n : ${er}`
    );

    return (resData.errors = er.message);
  }
}

async function getReportStatus(id) {
  let resData = {};

  try {
    resData = await to(reportModel.getReportStatus(id));

    return resData;
  } catch (er) {
    console.error(`Exception. \n : ${er}`);

    return (resData.errors = er.message);
  }
}

async function updateReportStatus(data, id) {
  let resData = {};

  try {
    resData = await to(reportModel.updateReportStatus(data, id));
    return resData;
  } catch (er) {
    console.error(`Exception. \n : ${er}`);

    return (resData.errors = er.message);
  }
}

async function getFilteredReports(domain) {
  let resData = {};

  try {
    resData = await to(reportModel.getFilteredReports(domain));

    return resData;
  } catch (er) {
    console.error(`Exception in  getting company domain reports : ${er}`);

    return (resData.errors = er.message);
  }
}

async function addTitles(id, data) {
  let resData = {};

  try {
    resData = await to(reportModel.addTitles(id, data));

    return resData;
  } catch (er) {
    console.error(`Exception in  getting updating titles data : ${er}`);

    return (resData.errors = er.message);
  }
}

async function titlePrefix(reportId, prefix) {
  let resData = {};

  try {
    resData = await to(reportModel.titlePrefix(reportId, prefix));

    return resData;
  } catch (er) {
    return (resData.errors = er.message);
  }
}

async function getPremiumReport(reportId) {
  try {
    const resData = await axios.get(
      `https://www.marketresearchfuture.com/show-report-data?access_key=e4e98249d561da9&id=${
        reportId.id
      }`
    );

    return resData.data;
  } catch (error) {
    return (error.errors = error.message);
  }
}

async function reportCharts(reportId, chartId, title, req, res) {
  let resData = {};
  try {
    resData = await to(reportModel.reportCharts(reportId));
    return resData;
  } catch (error) {
    return (error.errors = error.message);
  }
}

async function getIndustryReport(reportId){
  try {
    const resData = await to(reportModel.getIndustryReport(reportId));
    return resData;
  } catch (error) {
    return (error.errors = error.message);
  }
}

async function getReportByTitle(reportName) {
  try {
    let reportData = {};
    let newData = {};
    reportData =  await reportModel.getReportByTitle(reportName);
    if (reportData && reportData.length) {
      reportData.forEach(report => {
        report.title = `${report.title_prefix ? report.title_prefix : ""} ${
          report.title
        } `;
      });
      try {
        newData = await axios.get(
          `https://www.marketresearchfuture.com/platform-data?access_key=e4e98249d561da9&report_title=${reportName}`
        );
        if (newData) {
          newData = newData.data[0].searchreports.map(o => {
            return {
              id: o[0],
              title: o[1]
            };
          });
        }
        reportData.push(...newData);
      } catch (error) {
        console.error(error);
      }
    } else {
      try {
        newData = await axios.get(
          `https://www.marketresearchfuture.com/platform-data?access_key=e4e98249d561da9&report_title=${reportName}`
        );
        if (newData) {
          reportData = newData.data[0].searchreports.map(o => {
            return {
              id: o[0],

              title: o[1]
            };
          });
        }
      } catch (error) {
        console.error(error);
      }
    }
    return reportData;
  } catch (er) {
    console.error("Error in fetching report: error: " + er);

    return (reportData.errors = er.message);
  }
}

async function getReportById(id) {
  try {
    const resData = await to(reportModel.getReportById(id));
    return resData;
  } catch (err) {
    throw err;
  }
}


module.exports = {
  createReport,
  getReports,
  fetchReport,
  addNewCustomModule,
  addCompanyProfileData,
  addCompanyOverview,
  addSwotAnalysis,
  addKeyDevelopments,
  addStrategyInfo,
  getReportCompanyDetailsByKeyService,
  addNewCompanyData,
  deleteReportCompany,
  addReportStatus,
  getReportStatus,
  updateReportStatus,
  getFilteredReports,
  getReportCompleteData,
  addTitles,
  titlePrefix,
  getPremiumReport,
  reportCharts,
  getIndustryReport,
  getReportByTitle,
  getReportById
};
