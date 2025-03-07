const HTTPStatus = require('http-status');
const utilities = require('../utilities/utils');
const reportModel = require('./Reports.Controller');
const Reports = require("../Models/Reports.Model");
const mongoose = require("mongoose");


const getAllReportContent = async function (reportId, sectionId, mainSectionId, sectionPid) {
    let matchQuery = {};
  
    if (!utilities.isEmpty(reportId)) {
      matchQuery = {...matchQuery, ...{"_id": new mongoose.Types.ObjectId(reportId)}};
    }
  
    if (!utilities.isEmpty(mainSectionId)) {
      matchQuery = {...matchQuery, ...{"toc.main_section_id": parseInt(mainSectionId)}};
    }
  
    if (!utilities.isEmpty(sectionPid)) {
      matchQuery = {...matchQuery, ...{"toc.section_pid": {"$regex": new RegExp(`^${sectionPid}`, "i")}}};
    }
  
    if (!utilities.isEmpty(sectionId)) {
      matchQuery = {...matchQuery, ...{"toc.section_id": {"$regex": new RegExp(`^${sectionId}`, "i")}}};
    }
  
  
    const queryRes = await Reports.aggregate([
      {
        $match: matchQuery
      },
      {
        $unwind: "$toc"
      },
      {
        $match: matchQuery
      },
      {
        $group: {
          _id: "$_id", "toc": {$addToSet: "$toc"}
        }
      }
    ]);
  
    return queryRes;
  }
  
  const getContentByKey = function (reportId, sectionKey) {
  
    let matchQuery = {};
    matchQuery = {...matchQuery, ...{"_id": mongoose.Types.ObjectId(reportId)}};
    matchQuery = {...matchQuery, ...{"toc.meta.type": {$regex: (new RegExp(`.*${sectionKey.toLowerCase()}.*`, "i"))}}};
  
    const selectObj = {"toc.$.1": 1};
  
    const query = reportModel.findOne(matchQuery, selectObj);
  
    return (query.lean().exec({}));
  }

module.exports = {
  getContentByKey: async (req, res) => {
    try {
        const reportId = req.params['rid'];
        const sectionKey = req.query['sectKey']; // Define sectionKey at the beginning

        // console.log("Received Request:", { reportId, sectionKey });

        if (!reportId || !sectionKey) {
            return utilities.sendErrorResponse(
                HTTPStatus.BAD_REQUEST,
                true,
                { message: "Missing reportId or sectionKey in request" },
                res
            );
        }

        let tocData = {};
        let tocListData = {};

        if (!utilities.isEmpty(reportId)) {
            try {
                tocListData = await reportModel.getSectionDetailsFromSectionKey(reportId, sectionKey) || {};
            } catch (error) {
                console.error(`Error fetching section details for sectionKey (${sectionKey}):`, error);
                return utilities.sendErrorResponse(
                    HTTPStatus.INTERNAL_SERVER_ERROR,
                    true,
                    { message: "Error fetching section details", error },
                    res
                );
            }
        }

        if (tocListData?.tocList?.length > 0) {
            const sectionId = tocListData.tocList[0].section_id;

            try {
                tocData = await getAllReportContent(reportId, null, sectionId);
            } catch (error) {
                console.error(`Error fetching report content for sectionKey (${sectionKey}):`, error);
                return utilities.sendErrorResponse(
                    HTTPStatus.INTERNAL_SERVER_ERROR,
                    true,
                    { message: "Error fetching report content", error },
                    res
                );
            }
        } else {
            try {
                tocData = await getContentByKey(reportId, sectionKey);
            } catch (error) {
                console.error(`Error fetching content by key for sectionKey (${sectionKey}):`, error);
                return utilities.sendErrorResponse(
                    HTTPStatus.INTERNAL_SERVER_ERROR,
                    true,
                    { message: "Error fetching content by key", error },
                    res
                );
            }
        }

        if (!utilities.isEmpty(tocData.errors)) {
            return utilities.sendErrorResponse(
                HTTPStatus.BAD_REQUEST,
                true,
                tocData.errors,
                res
            );
        }

        return utilities.sendResponse(HTTPStatus.OK, tocData, res);
    } catch (er) {
        console.error(`Exception in retrieving content data using sectionKey (${req.query['sectKey']}) : ${er.message}`);
        return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}
}