const mongoose = require('mongoose');
const { Schema } = mongoose;
const DATA_CONSTANTS = require('../config/dataConstants');

const TableOfContentSchema = new Schema(
  {
    section_name: {
      type: Schema.Types.String,
      required: [true, 'ToC title is required'],
      trim: true,
    },
    main_section_id: { 
      type: Schema.Types.Number,
      required: [true, 'ToC main section id (#) is required'],
    },
    section_id: { 
      type: Schema.Types.String,
      required: [true, 'ToC section id (#) is required'],
      trim: true,
    }, 
    section_pid: { 
      type: Schema.Types.String,
      required: [true, 'ToC section immediate parent id (#) is required'],
      trim: true,
    },
    content: [{
      _id: false,
      order_id: { type: Schema.Types.Number },
      type: { type: Schema.Types.String },
      source: { type: Schema.Types.String },
      title: { type: Schema.Types.String },
      data: { type: Schema.Types.Mixed },
    }],
    meta: {
      _id: false,
      type: {
        type: Schema.Types.String,
        enum: Object.values(DATA_CONSTANTS.MODULES_META_TYPE),
        required: true,
      },
      data: {
        type: Schema.Types.Mixed,
      },
    },
    meta_info: { type: Schema.Types.Mixed },
    status: {
      type: Schema.Types.String,
      enum: Object.values(DATA_CONSTANTS.MODULES_STATUS),
      default: DATA_CONSTANTS.MODULES_STATUS.NOT_STARTED,
    },
    analysts: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ToC', TableOfContentSchema);
