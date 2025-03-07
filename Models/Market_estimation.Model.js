const mongoose = require('mongoose');
const {Schema} = mongoose;
const DATA_CONSTANTS = require('../config/dataConstants');

const MarketEstimationSchema = new Schema(
  {
    base_year: {
      type: Number,
      required: [true, 'Base Year is required'],
      trim: true,
    },
    start_year: {
      type: Number,
      required: [true, 'Start Year is required'],
      trim: true,
    },
    end_year: {
      type: Number,
      required: [true, 'End Year is required'],
      trim: true,
    },
    segment: [{
      _id: false,
      name: {
        type: String,
        required: [true, 'Segment name is required'],
        trim: true,
      },
      id: {
        type: String,
        required: [true, 'Segment Identifier (#) is required'],
        trim: true,
      },
      pid: {
        type: String,
      },
    }],
    geo_segment: [{
      region: String,
      _id: String,
      id: String,
      countries: [{
        type: Schema.Types.Mixed,
        trim: true,
      }],
    }],
    bifurcationLevel: {
      type: Number,
      default: 1,
    },
    data: {
      type: Schema.Types.Mixed,
    },
    dataMetrics: {
      type: String,
      enum: Object.values(DATA_CONSTANTS.REPORT_DATA_UNIT),
      default: DATA_CONSTANTS.REPORT_DATA_UNIT.VALUE,
    },
    status: {
      type: String,
      enum: Object.values(DATA_CONSTANTS.MODULES_STATUS),
      default: DATA_CONSTANTS.MODULES_STATUS.NOT_STARTED,
    },
    analysts: {
      type: Schema.Types.ObjectId,
      trim: true,
      ref: 'users',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('me', MarketEstimationSchema);
