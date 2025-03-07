const createError = require("http-errors");
const _ = require('lodash');
const Reports = require("../Models/Reports.Model");
const mongoose = require("mongoose");
const HTTPStatus = require("http-status-codes");
const utilities = require('../utilities/utils')
const to = require('../utilities/to')
const { getFromRedis, setToRedis } = require("../config/redis");

// const meModel = require('../Models/me.modal');
// // import meService from "../market_estimation/me.service";
const dataConstants = require('../config/dataConstants');
const axios = require("axios");
const reportService = require('../service/report.service')


module.exports = {
    createReport: async (req, res, next) => {
        try {
          const reportDetails = req.body;
          const rdetails = { ...reportDetails };
          const reportObj = new Reports(rdetails);
          const savedReport = await reportObj.save();
          res.json({data:savedReport});
        } catch (error) {
          next(error);
        }
      },
    
      getReports: async (req, res, next) => {
        try {
            const user = req.user;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10; 
            const skip = (page - 1) * limit;
    
            const reports = await Reports.aggregate([
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
                },
                {
                    $project: {
                        _id: 0,
                        reports: { $slice: ["$reports", skip, limit] }, // Apply pagination
                        count: 1
                    }
                }
            ]);
    
            let allReports = [];
            for (const item of reports) {
                allReports.push(...item.reports);
            }
    
            const totalReports = await Reports.countDocuments({
                approved: true,
                $or: [
                    { isAnalytics: true },
                    { isPdf: true }
                ]
            });
    
            res.json({
                data: allReports,
                count: allReports.length,
                totalReports,
                totalPages: Math.ceil(totalReports / limit),
                currentPage: page
            });
        } catch (error) {
            next(error);
        }
    },
    
    
      getReportNameString: (req, res, next) => {
        try {
          const str = req.params.str;
          let temp = str.replace(/[^a-zA-Z0-9 ]/g, " ").trim();
          temp = temp.replace(/ {2,}/g, " ");
          temp = temp.split(" ").join(" ");
          res.json({data:{ sanitizedString: temp }});
        } catch (error) {
          next(error);
        }
      },

      fetchReport: async (req, res) => {
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
      },
    
      fetchReportCp: async (req, res, next) => {
        console.log("req.body", req.body); // Fixed to log req.body instead of res
        try {
          const reportId = req.params.rid || null;
          const reportName = req.query.title || null;
          const vertical = req.query.vertical || null;
          const companyId = req.query.cid || null;
          const selectKeys = req.query.select || "";
      
          try {
            // Fetch report data from the database
            const query = Reports.find();
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
    },

    fetchMe: async (req, res, next) => {
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
    
        const reports = await Reports.find(query).select("me").lean();
    
        if (!reports.length) {
          return res.json({ message: "No Data found" });
        }
    
        res.json({ data: reports });
      } catch (error) {
        next(error);
      }
    },

    fetchCp : async (req, res, next)=>{
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
    
        const reports = await Reports.find(query).select("title category vertical cp me.start_year me.end_year me.base_year overlaps owner tocList status title_prefix youtubeContents").lean();
    
        if (!reports.length) {
          return res.status(404).json({ message: "No reports found" });
        }
    
        res.json({ data: reports });
      } catch (error) {
        next(error);
      }
    },
    fetchCpp : async (req, res, next)=>{
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
    
        const reports = await Reports.find(query).select("title category vertical cp me.start_year me.end_year me.base_year overlaps owner tocList status title_prefix youtubeContents").lean();
    
        if (!reports.length) {
          return res.status(404).json({ message: "No reports found" });
        }
    
        res.json({ data: reports });
      } catch (error) {
        next(error);
      }
    },

    getReportCpData : async (req, res, next) => {
      try {
        let { reportName, vertical, selectKeys, companyId } = req.query;
        let { rid } = req.params;
        let user = req.user; 
    
        let query = { approved: true }; 
    
        if (rid) query._id = new mongoose.Types.ObjectId(rid);
        if (reportName)  
          query.where({
            searching_title: {
              $regex: new RegExp(reportName, "i")
            },
            approved: true
          });
        if (vertical) query.vertical = vertical;
        if (companyId) query["cp.company_id"] = companyId;
        
        // Fixing Optional Chaining Issue
        if (user && user.strictlyAllowedReportTypes && user.strictlyAllowedReportTypes.length) {
          query.vertical = { $in: user.strictlyAllowedReportTypes };
        }
        
        if (user && user.reportIds && user.reportIds.length) {
          query._id = { $in: user.reportIds };
        }
    
        const data = await Reports.find(query)
          .select("cp")
          .lean();
    
        if (!data.length) {
          return res.status(404).json({ message: "No reports found" });
        }
        const formattedData = {
          ...data[0], // Take the first object from the array
          id: data[0]._id, // Rename `_id` to `id`
        };
        delete formattedData._id; // Remove `_id` after renaming
    
        res.json({ data: formattedData }); // Return as an object instead of an array
      } catch (error) {
        next(error);
      }
    },

    searchReportTitle: async (req, res, next) => {
      try {
        let { reportName, vertical, selectKeys, companyId } = req.query;
        let { rid } = req.params;
        let user = req.user; 
    
        let query = { approved: true }; 
    
        if (rid) query._id = new mongoose.Types.ObjectId(rid);
        if (reportName) query.searching_title = { $regex: new RegExp(reportName, "i") };
        if (vertical) query.vertical = vertical;
        if (companyId) query["cp.company_id"] = companyId;
        
        if (user?.strictlyAllowedReportTypes?.length) {
          query.vertical = { $in: user.strictlyAllowedReportTypes };
        }
    
        if (user?.reportIds?.length) {
          query._id = { $in: user.reportIds };
        }
    
        // Run DB query and API call in parallel
        let dbPromise = Reports.find(query)
          .select("title isAnalytics approved isExcel isPdf isDoc pdfLink excelLink docLink")
          .lean();
    
        let apiPromise = reportName
          ? axios.get(
              `https://www.marketresearchfuture.com/platform-data?access_key=e4e98249d561da9&report_title=${reportName}`,
              { timeout: 2000 } // Set 3-second timeout
            ).then(response => response?.data[0]?.searchreports?.map(o => ({ id: o[0], title: o[1] })))
            .catch(error => {
              console.error("Error fetching premium reports:", error.message);
              return [];
            })
          : Promise.resolve([]);
    
        // Execute both in parallel
        let [reports, premiumReports] = await Promise.all([dbPromise, apiPromise]);
    
        let reportData = [...(reports || []), ...(premiumReports || [])];
    
        if (!reportData.length) {
          return res.status(404).json({ message: "No reports found" });
        }
    
        res.json({ data: reportData });
    
      } catch (error) {
        next(error);
      }
    },
       
      getReportByKeys: async (reportId, keyString = "") => {
        const query = Reports.find();
        query.where({ _id: new mongoose.Types.ObjectId(reportId) });
        if (keyString) {
          query.select(keyString);
        }
        return query.lean().exec({ virtuals: true });
      },
    
      searchReportByName: async (req, res, next) => {
        try {
          const { searchString, keyString } = req.body;
          const query = Reports.find();
          query.select(keyString);
          query.where({
            searching_title: {
              $regex: `\\b${getReportNameString(searchString)}\\b`,
              $options: "i"
            }
          });
          const report = await query.lean().exec({ virtuals: true });
          res.json({data:report});
        } catch (error) {
          next(error);
        }
      },
    
      getReportsByKeys: async (req, res, next) => {
        try {
          const { keys = "", ids = [] } = req.body;
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
          const reports = await query.lean().exec({ virtuals: true });
          res.json({data:reports});
        } catch (error) {
          next(error);
        }
      },
    
      fetchReportForCompany: async (req, res, next) => {
        try {
          const { selectKeys, companyId, companyName } = req.body;
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
    
          const reports = await query.lean().exec({ virtuals: true });
          res.json({data:reports});
        } catch (error) {
          next(error);
        }
      },
    
      addNewCustomModule: async (req, res, next) => {
        try {
          const { reportId, moduleObj } = req.body;
          const moduleObjNew = { ...moduleObj, ...{ is_main_section_only: true } };
          const updateRes = await Reports.update(
            { _id: mongoose.Types.ObjectId(reportId) },
            { $push: { tocList: moduleObjNew } },
            { new: true, upsert: true, setDefaultsOnInsert: true }
          );
          res.json({data:updateRes});
        } catch (error) {
          next(error);
        }
      },

      getSectionDetailsFromSectionKey: async (reportId, sectionKey) => {
        try {
          // Validate reportId
          if (!mongoose.Types.ObjectId.isValid(reportId)) {
            throw new Error("Invalid reportId format");
          }
    
          const matchQuery = {
            _id: new mongoose.Types.ObjectId(reportId),
            "tocList.section_key": { $regex: new RegExp(sectionKey, "i") }
          };
    
          const selectObj = { "tocList.$": 1 };
    
          // Fetch data using async/await
          const result = await Reports.findOne(matchQuery, selectObj).lean().exec();
    
          return result;
        } catch (error) {
          console.error("Error fetching section details:", error);
          throw error; // Ensure error is propagated
        }
      },
    
      addCompanyProfileData: async (req, res, next) => {
        try {
          const { reportId, companyList } = req.body;
          const queryPromise = await Reports.update(
            { _id: mongoose.Types.ObjectId(reportId) },
            { cp: companyList },
            { new: true, setDefaultsOnInsert: true }
          );
          res.json({data:queryPromise});
        } catch (error) {
          next(error);
        }
      },
    
      addNewCompanyData: async (req, res, next) => {
        try {
          const { reportId, company } = req.body;
          const cpData = await Reports.update(
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
          res.json({data:cpData});
        } catch (error) {
          next(error);
        }
      },

      deleteReportCompany: async (req, res, next) => {
        try {
          const { reportId, company } = req.body;
          const cpData = await Reports.update(
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
          res.json({data:cpData});
        } catch (error) {
          next(error);
        }
      },
    
      addReportOverlapsData: async (req, res, next) => {
        try {
          const { data, reportId } = req.body;
          const result = await Reports.updateOne(
            { _id: mongoose.Types.ObjectId(reportId) },
            {
              $set: { overlaps: data.overlaps, youtubeContents: data.youtubeContents }
            },
            { new: true, setDefaultsOnInsert: true }
          );
          res.json({data:result});
        } catch (error) {
          next(error);
        }
      },
    
      addCompanyOverview: async (req, res, next) => {
        try {
          const { coData, cpID, reportId } = req.body;
          const queryPromise = await Reports.update(
            {
              _id: mongoose.Types.ObjectId(reportId),
              "cp.company_id": mongoose.Types.ObjectId(cpID)
            },
            {
              $set: { "cp.$.company_overview": coData }
            },
            { new: true, setDefaultsOnInsert: true }
          );
          res.json({data:queryPromise});
        } catch (error) {
          next(error);
        }
      },
    
      addSwotAnalysis: async (req, res, next) => {
        try {
          const { saData, cpID, reportId } = req.body;
          const queryPromise = await Reports.update(
            {
              _id: mongoose.Types.ObjectId(reportId),
              "cp.company_id": mongoose.Types.ObjectId(cpID)
            },
            {
              $set: { "cp.$.swot_analysis": saData }
            },
            { new: true, setDefaultsOnInsert: true }
          );
          res.json({data:queryPromise});
        } catch (error) {
          next(error);
        }
      },
    
      addKeyDevelopments: async (req, res, next) => {
        try {
          const { kdData, cpID, reportId } = req.body;
          const queryPromise = await Reports.update(
            {
              _id: mongoose.Types.ObjectId(reportId),
              "cp.company_id": mongoose.Types.ObjectId(cpID)
            },
            {
              $set: { "cp.$.key_development": kdData }
            },
            { new: true, setDefaultsOnInsert: true }
          );
          res.json({data:queryPromise});
        } catch (error) {
          next(error);
        }
      },
    
      addStrategyInfo: async (req, res, next) => {
        try {
          const { stData, cpID, reportId } = req.body;
          const queryPromise = await Reports.update(
            {
              _id: mongoose.Types.ObjectId(reportId),
              "cp.company_id": mongoose.Types.ObjectId(cpID)
            },
            {
              $set: { "cp.$.strategy": stData }
            },
            { new: true, setDefaultsOnInsert: true }
          );
          res.json({data:queryPromise});
        } catch (error) {
          next(error);
        }
      },
    
      getCompanyReportDataByKey: async (req, res, next) => {
       try {
    const reportId = req.params["rid"];
    const companyId = req.query["cid"];
    const key = req.query["key"];
    
    try {
      console.log("reportId", reportId);
      
      let query = Reports.find(
        { _id: mongoose.Types.ObjectId(reportId) },
        "title"
      );

      if (!utilities.isEmpty(companyId) && !utilities.isEmpty(key)) {
        query = query.findOne(
          { "cp.company_id": companyId },
          `cp._id cp.company_name cp.company_id cp.${key}`
        );
      }

      console.log("query", query);
      
      const cpData = await query.lean().exec({ virtuals: true }) || {};

      if (!utilities.isEmpty(cpData.errors)) {
        return utilities.sendErrorResponse(
          HTTPStatus.BAD_REQUEST,
          true,
          cpData.errors,
          res
        );
      } else {
        return utilities.sendResponse(HTTPStatus.OK, cpData, res);
      }
    } catch (er) {
      console.error(
        `Exception in fetching company report data for company (${companyId}) and report (${reportId}) : ${er}`
      );
      return utilities.sendErrorResponse(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        true,
        er.message,
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
      },
    
      getReportMenuItems: async (req, res, next) => {
        try {
          const { reportId } = req.params;
          console.log("reportIdd",reportId)
          const reportData = await Reports.findOne({ _id: mongoose.Types.ObjectId(reportId) });
          res.json({data:reportData});
        } catch (error) {
          // next(error);
        }
      },
    
      getReportCompleteData: async (req, res, next) => {
        try {
          const { id } = req.params;
          const reportData = await Reports.findOne({ _id: mongoose.Types.ObjectId(id) });
          res.json({data:reportData});
        } catch (error) {
          next(error);
        }
      },
    
      getFilteredReports: async (req, res, next) => {
        try {
          const { domain } = req.params;
          const reportData = await Reports.find({ vertical: domain });
          res.json({data:reportData});
        } catch (error) {
          next(error);
        }
      },
    
      addReportStatus: async (req, res, next) => {
        try {
          const { data, id } = req.body;
          const queryPromise = await Reports.updateOne(
            { _id: mongoose.Types.ObjectId(id) },
            { status: data },
            { upsert: true }
          );
          res.json({data:queryPromise});
        } catch (error) {
          next(error);
        }
      },
    
      getReportStatus: async (req, res, next) => {
        try {
          const { id } = req.params;
          const queryPromise = await Reports.findOne({ _id: mongoose.Types.ObjectId(id) }).select("status");
          res.json({data:queryPromise});
        } catch (error) {
          next(error);
        }
      },
    
      updateReportStatus: async (req, res, next) => {
        try {
          const { data, id } = req.body;
          const queryPromise = await Reports.updateMany(
            {
              _id: mongoose.Types.ObjectId(id),
              "status.main_section_id": data.section_id
            },
            { $set: { "status.$.status": data.status } }
          );
          res.json({data:queryPromise});
        } catch (error) {
          next(error);
        }
      },
    
      getMeChartsByTitles: async (req, res, next) => {
        try {
          const { str } = req.params;
          const titles = str.split(',').map(title => decodeURIComponent(title.trim()));
          const regexTerms = titles.map(title => new RegExp(title, 'i'));
          const query = Reports.find();
          query.where({ "titles.title": { $in: regexTerms } });
          query.select("titles _id title");
          const result = await query.lean().exec({ virtuals: true });
          res.json({data:result});
        } catch (error) {
          next(error);
        }
      },
    
      getMeChartsCount: async (req, res, next) => {
        try {
          const query = Reports.aggregate([
            {
              $match: {
                $or: [
                  { titles: { $exists: true, $ne: null } },
                  { "me.data": { $exists: true, $ne: null } }
                ],
                $and: [{ approved: true }]
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
          const result = await query;
          res.json({data:result});
        } catch (error) {
          next(error);
        }
      },
    
      getMeChartsTitlesById: async (req, res, next) => {
        try {
          const { id } = req.params;
          const query = Reports.find();
          query.where({ _id: mongoose.Types.ObjectId(id) });
          query.select("titles _id title");
          const result = await query.lean().exec({ virtuals: true });
          res.json({data:result});
        } catch (error) {
          next(error);
        }
      },
    
      getRelatedReportReports: async (req, res, next) => {
        try {
          const { reportId } = req.params;
          const query = Reports.find({ _id: mongoose.Types.ObjectId(reportId) });
          if (!utilities.isEmpty(reportId)) {
            query.findOne({ "overlaps.section_name": "Report" }, { "overlaps.$.1": 1 });
          }
          const result = await query.lean().exec({ virtuals: true });
          res.json({data:result});
        } catch (error) {
          next(error);
        }
      },
    
      addTitles: async (req, res, next) => {
        try {
          const { id, data } = req.body;
          const queryPromise = await Reports.updateOne(
            { _id: mongoose.Types.ObjectId(id) },
            { titles: data },
            { upsert: true }
          );
          res.json({data:queryPromise});
        } catch (error) {
          next(error);
        }
      },

      getContentByKey: async (reportId, metaKey) => {
        try {
          const matchQuery = {
            _id: mongoose.Types.ObjectId(reportId),
            "toc.meta_info.section_key": { $regex: new RegExp(`.*${metaKey}.*`, "i") }
          };
          const selectObj = { "toc.$.1": 1 };
          const query = await Reports.findOne(matchQuery, selectObj).lean().exec();
          return query;
        } catch (error) {
          throw error;
        }
      },
    
      getContentByName: async (reportId, metaName) => {
        try {
          const matchQuery = {
            _id: mongoose.Types.ObjectId(reportId),
            "toc.meta_info.section_value": { $regex: new RegExp(`.*${metaName}.*`, "i") }
          };
          const selectObj = { "toc.$.1": 1 };
          const query = await Reports.findOne(matchQuery, selectObj).lean().exec();
          return query;
        } catch (error) {
          throw error;
        }
      },
    
      getContentBySectionName: async (reportId, sectionName) => {
        try {
          const matchQuery = {
            _id: mongoose.Types.ObjectId(reportId),
            "toc.section_name": { $regex: new RegExp(`.*${sectionName}.*`, "i") }
          };
          const selectObj = { "toc.$.1": 1 };
          const query = await Reports.findOne(matchQuery, selectObj).lean().exec();
          return query;
        } catch (error) {
          throw error;
        }
      },
    
      titlePrefix: async (reportId, prefix) => {
        try {
          const updateResult = await Reports.updateOne(
            { _id: mongoose.Types.ObjectId(reportId) },
            { title_prefix: prefix.title_prefix },
            { upsert: true }
          );
          return updateResult;
        } catch (error) {
          throw error;
        }
      },
    
      setReportModuleSequence: async (data, reportId) => {
        try {
          console.log("tocList", data);
          const updateResult = await Reports.updateOne(
            { _id: mongoose.Types.ObjectId(reportId) },
            { tocList: data },
            { upsert: true }
          );
          return updateResult;
        } catch (error) {
          throw error;
        }
      },
    
      setPdfReport: async (reportId, link) => {
        try {
          const updateResult = await Reports.updateOne(
            { _id: mongoose.Types.ObjectId(reportId) },
            { pdfLink: link, isPdf: true },
            { upsert: true }
          );
          return updateResult;
        } catch (error) {
          throw error;
        }
      },
    
      addPdfReport: async (title, link) => {
        try {
          const reportObj = new Reports({
            title: title,
            pdfLink: link,
            isAnalytics: false,
            isPdf: true
          });
          const savedReport = await reportObj.save();
          return savedReport;
        } catch (error) {
          throw error;
        }
      },
    
      readCSV: async (req, res, next) => {
        try {
          console.log("Read CSV");
          fs.readFile("./uploads/report_data3.json", async (err, jsonString) => {
            try {
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
                let url = obj.docLink || obj.pdfLink || obj.excelLink;
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
                  obj.vertical = d ? getVertical(d) : dataConstants.REPORT_CATEGORY.DEFAULT;
                }
                reportsData.push(obj);
              });
              console.log("pdfDomains", pdfDomains);
              for (const item of reportsData) {
                const query = { title: item.title };
                const update = { $set: { ...item } };
                const options = { upsert: true };
                await Reports.updateOne(query, update, options);
              }
              return res.send({ Message: "Operation Completed" });
            } catch (e) {
              console.log(e);
              return res.status(500).send(e);
            }
          });
        } catch (error) {
          next(error);
        }
      },
    
      getVertical: (domain) => {
        if (domain === "AND") {
          return "AnD";
        } else if (domain === "CnM" || domain === "CNM") {
          return "CNM";
        } else if (["EnP", "IAE", "CFnB", "CFNB", "ENP", "AGRI", "PCM", "ICT"].includes(domain)) {
          return domain;
        } else if (domain === "HC") {
          return "Healthcare";
        } else if (domain === "Automotive" || domain === "Auto" || domain === "AUTOMOTIVE") {
          return "Auto";
        } else if (domain === "SEM") {
          return "SEMI";
        } else {
          console.log("domain=>", domain);
          return "default";
        }
      },
    
      // searchReport: async (req, res, next) => {
      //   try {
      //     let q = req.query.q || null;
      //     const reports = await Reports.find(
      //       {
      //         searching_title: {
      //           $regex: `\\b${getReportNameString(q)}\\b`,
      //           $options: "i"
      //         },
      //         approved: true
      //       },
      //       { title: 1, _id: 1 }
      //     );
      //     res.status(200).send({ data: reports });
      //   } catch (error) {
      //     console.log("Error in search API", error);
      //     res.status(500).send(error);
      //   }
      // },
    
      reportCharts: async (reportId) => {
        try {
          const reportData = await Reports.findOne({
            _id: mongoose.Types.ObjectId(reportId)
          });
          return reportData;
        } catch (error) {
          throw error;
        }
      },
    
      getTitles: async (req, res) => {
        try {
          const query = await Reports.aggregate([
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
          res.status(200).send(query);
        } catch (error) {
          res.status(500).send(error);
        }
      },
    
      getIndustryReport: async (reportId) => {
        try {
          const reportData = await Reports.findOne({
            _id: mongoose.Types.ObjectId(reportId.rid)
          });
          return reportData;
        } catch (error) {
          throw error;
        }
      },
    
      getReportByTitle: async (title) => {
        try {
          const reports = await Reports.find({ searching_title: RegExp(title, 'i'), approved: true });
          return reports;
        } catch (error) {
          throw error;
        }
      },
    
      getReportById: async (id) => {
        try {
          const report = await Reports.findOne({ _id: mongoose.Types.ObjectId(id) });
          return report;
        } catch (error) {
          throw error;
        }
      }

}