import mongoose, { Schema, SchemaTypes } from "mongoose";

const ReportAccessSchema = new Schema(
  {
    reportIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "reports" }],
      ref: "reports"
    },
    charts:{
      type:[{type:Object}],
      ref:"charts"
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const ReportAccess = mongoose.model("report_access", ReportAccessSchema);

const getReportsList = function(userId) {
  const query = ReportAccess.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId)
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
        charts:1
      }
    }
  ]);

  return query;
};

const addReports = async function(data) {
  const query = data;
  console.log('query', query)
  try {
    const doesExist = await ReportAccess.findOne({ userId: mongoose.Types.ObjectId(query.userId) });
    if (doesExist) {
      const updatedReport = await ReportAccess.findOneAndUpdate(
        { userId: mongoose.Types.ObjectId(query.userId) },
        { $set: { reportIds: query.reportIds } }
      );
      return updatedReport;
    } else {
      const newData = new ReportAccess(query);
      const result = await newData.save();
      return result;
    }
  } catch (error) {
    console.error("Error in addReports:", error);
    throw error;
  }
};


const updateReports = async function(data) {
  const query = data;
  console.log("query", query);
  try {
    const existingReport = await ReportAccess.findOneAndUpdate(
      { userId: mongoose.Types.ObjectId(query.userId) },
      { $set: { reportIds: query.reportIds } }
    );
    return existingReport;
  } catch (error) {
    console.error("Error in addOrUpdateReport:", error);
    throw error;
  }
};

const addCharts = async function(data) {
  const query = data;
  console.log('query', query)
  try {
    const doesExist = await ReportAccess.findOne({
      userId: mongoose.Types.ObjectId(query.userId)
    });

    if (doesExist) {
      const existingCharts = await ReportAccess.findOneAndUpdate(
        { userId: mongoose.Types.ObjectId(query.userId) },
        { $set: { charts: query.charts } }
      );
      return existingCharts;
     } else {
      const newData = new ReportAccess(query);
      const result = await newData.save();
      return result;
    }
  } catch (error) {
    console.error("Error in addReports:", error);
    throw error;
  }
};

const updateCharts = async function(data) {
  const query = data;
  console.log("query", query);
  try {
    const existingReport = await ReportAccess.findOneAndUpdate(
      { userId: mongoose.Types.ObjectId(query.userId) },
      { $set: { charts: query.charts } }
    );
    return existingReport;
  } catch (error) {
    console.error("Error in addOrUpdateReport:", error);
    throw error;
  }
};



module.exports = {
  getReportsList,
  addReports,
  updateReports,
  addCharts,
  updateCharts
};
