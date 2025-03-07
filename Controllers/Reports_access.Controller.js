const mongoose = require("mongoose");
const ReportAccess = require("../Models/Reports_access.Model");

// Controller Methods
module.exports = {
    // Fetch reports list based on userId
    getReportsList: async (req, res, next) => {
        try {
            const userId = req.body.userId; // Fetch userId from params
            console.log(userId)
            const reportsList = await ReportAccess.aggregate([
                {
                    $match: {
                        userId: new mongoose.Types.ObjectId(userId)  // Convert to ObjectId
                    }
                },
                {
                    $lookup: {
                        from: "reports",
                        localField: "reportIds",
                        foreignField: "_id",
                        as: "reports"
                    }
                },
                {
                    $project: {
                        userId: 1,
                        reportIds: {
                            $map: {
                                input: "$reports",
                                as: "report",
                                in: {
                                    _id: "$$report._id",
                                    approved: "$$report.approved",
                                    createdAt: "$$report.createdAt",
                                    isAnalytics: "$$report.isAnalytics",
                                    isDoc: "$$report.isDoc",
                                    isExcel: "$$report.isExcel",
                                    isPdf: "$$report.isPdf",
                                    title: "$$report.title"
                                }
                            }
                        },
                        charts: 1
                    }
                }
            ]);

            res.json({ data: reportsList });
        } catch (error) {
            next(error);
        }
    },

    // Add or update reports for a user
    addReports: async (req, res, next) => {
        try {
            const query = req.body;
            const doesExist = await ReportAccess.findOne({ userId: new mongoose.Types.ObjectId(query.userId) }); // Convert to ObjectId
            
            if (doesExist) {
                const updatedReport = await ReportAccess.findOneAndUpdate(
                    { userId: new mongoose.Types.ObjectId(query.userId) }, // Convert to ObjectId
                    { $set: { reportIds: query.reportIds } },
                    { new: true } // Return the updated document
                );
                res.json({ data: updatedReport });
            } else {
                const newReport = new ReportAccess(query);
                const result = await newReport.save();
                res.json({ data: result });
            }
        } catch (error) {
            next(error);
        }
    },

    // Update reports for a user
    updateReports: async (req, res, next) => {
        try {
            const query = req.body;
            const updatedReport = await ReportAccess.findOneAndUpdate(
                { userId: new mongoose.Types.ObjectId(query.userId) }, // Convert to ObjectId
                { $set: { reportIds: query.reportIds } },
                { new: true } // Return the updated document
            );
            res.json({ data: updatedReport });
        } catch (error) {
            next(error);
        }
    },

    // Add or update charts for a user
    addCharts: async (req, res, next) => {
        try {
            const query = req.body;
            const doesExist = await ReportAccess.findOne({ userId: new mongoose.Types.ObjectId(query.userId) }); // Convert to ObjectId
    
            if (doesExist) {
                const updatedCharts = await ReportAccess.findOneAndUpdate(
                    { userId: new mongoose.Types.ObjectId(query.userId) }, // Convert to ObjectId
                    { $set: { charts: query.charts } },
                    { new: true } // Return the updated document
                );
                res.json({ data: updatedCharts });
            } else {
                const newReport = new ReportAccess(query);
                const result = await newReport.save();
                res.json({ data: result });
            }
        } catch (error) {
            next(error);
        }
    },

    // Update charts for a user
    updateCharts: async (req, res, next) => {
        try {
            const query = req.body;
            const updatedCharts = await ReportAccess.findOneAndUpdate(
                { userId: new mongoose.Types.ObjectId(query.userId) }, // Convert to ObjectId
                { $set: { charts: query.charts } },
                { new: true } // Return the updated document
            );
            res.json({ data: updatedCharts });
        } catch (error) {
            next(error);
        }
    },
};
