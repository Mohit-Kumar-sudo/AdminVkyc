import mongoose, {Schema, SchemaTypes} from 'mongoose';
import { loggers } from 'winston';

const RequestsHistorySchema = new Schema(
  {
    originalUrl: {
      type: String,
    },
    baseUrl: {
      type: String,
    },
    params: {
      type: SchemaTypes.Mixed,
    },
    query: {
      type: SchemaTypes.Mixed,
    },
    route: {
      type: SchemaTypes.Mixed,
    },
    request_type: {
      type: String,
    },
    other: {
      type: String,
    },
    reportId: {
      type: Schema.Types.ObjectId,
      ref: 'reports',
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const RequestsHistory = mongoose.model('requests_history', RequestsHistorySchema);


const RequestsHistoryData = function (Data, userId) {
  const historyData = Data
  historyData.originalUrl = Data.originalUrl,
  historyData.route = Data.route

  const newData = new RequestsHistory(historyData)
  
  const result =  newData.save()

  return result;

}

const getHistoryReportById = function(id) {
  const queryPromise = RequestsHistory.find({userId:mongoose.Types.ObjectId(id)});
  return queryPromise;
};

// Exporting model to external world
module.exports = {
  RequestsHistory,
  RequestsHistoryData,
  getHistoryReportById
};