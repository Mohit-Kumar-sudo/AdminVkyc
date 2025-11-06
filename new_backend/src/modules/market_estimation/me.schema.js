import mongoose, { Schema, SchemaTypes } from 'mongoose';

import DATA_CONSTANTS from '../../config/dataConstants';

// Market Estimation schema
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
        _id:false,
        name: {
            type: SchemaTypes.String,
            required: [true, 'Segment name is required'],
            trim: true
        },
        id : {
            type: SchemaTypes.String,
            required: [true, 'Segment Identifier (#) is required'],
            trim: true
        },
        pid : {
            type: SchemaTypes.String,
        }
    }],
    geo_segment: [{
      // _id: false,
      region: SchemaTypes.String,
      _id: SchemaTypes.String,
      id: SchemaTypes.String,
      countries: [{
        type: SchemaTypes.Mixed,
        trim: true
      }]
    }],
    bifurcationLevel:{
      type:Number,
      default: 1
    },
    data : {
        type: SchemaTypes.Mixed,
    },
    dataMetrics : {
        type: SchemaTypes.String,
        enum: Object.values(DATA_CONSTANTS.REPORT_DATA_UNIT),
        default: DATA_CONSTANTS.REPORT_DATA_UNIT.VALUE
    },
    status: {
        type: SchemaTypes.String,
        enum: Object.values(DATA_CONSTANTS.MODULES_STATUS),
        default: DATA_CONSTANTS.MODULES_STATUS.NOT_STARTED
    },
    analysts: {
        type: Schema.Types.ObjectId,
        //required: [true, 'Analysts details are required'],
        trim: true,
        ref: 'users'
    }
},
{
    timestamps: true,
}
);

MarketEstimationSchema.methods = {

};

// mongoose.model("me", MarketEstimationSchema);

// Exporting Schema
module.exports = mongoose.model('me', MarketEstimationSchema);
