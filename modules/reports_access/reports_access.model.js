import mongoose, { Schema, SchemaTypes } from "mongoose";

const ReportAccessSchema = new Schema(
  {
    reportIds: {
      type: [{ type: Schema.Types.ObjectId, ref: 'reports' }],
      ref: 'reports'
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
        from: 'reports',
        localField: 'reportIds',
        foreignField: '_id',
        as: 'reports'
      }
    },
    {
      $project: {
        userId: 1,
        reportIds: {
          $map: {
            input: '$reports',
            as: 'report',
            in: {
              _id: '$$report._id',
              approved: '$$report.approved',
              createdAt: '$$report.createdAt',
              isAnalytics: '$$report.isAnalytics',
              isDoc: '$$report.isDoc',
              isExcel: '$$report.isExcel',
              isPdf: '$$report.isPdf',
              title: '$$report.title'
            }
          }
        }
      }
    }
  ]);
  
  return query;
};

const addReports = function(data) {
  const query = data;
  (query.userId = data.userId), (query.reportIds = data.reportIds);
  const newData = new ReportAccess(query);
  const result = newData.save();
  return result;
};

const updateReports = function(data) {
  const query = ReportAccess.updateOne(
    { userId: mongoose.Types.ObjectId(data.userId) },
    { $set: { reportIds: data.reportIds } }
  );
  return query;
};

module.exports = {
  getReportsList,
  addReports,
  updateReports
};
