const utilities = require('../utilities/utils')
const to = require('../utilities/to')
const axios = require("axios");
const ReportModel = require("./report.model");



module.exports = {
    fetchReport : async (reportId,reportName,vertical,selectKeys,companyId,companyName,user) => {
        let reportData = {};
        let newData = {};
        try {
          if (utilities.isEmpty(companyId) && utilities.isEmpty(companyName)) {
            console.log('reportId ======>', reportId)
            reportData = await to(
                ReportModel.fetchReport(
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
}