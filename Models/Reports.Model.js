const DATA_CONSTANTS = require("../config/dataConstants");
const validator = require("validator");
const mongoose = require("mongoose");
const {Schema} = mongoose;
const MarketEstimationSchema = require("./Market_estimation.Model");
const TableOfContentSchema = require("./Table_of_contents.Model");
const SecondaryContentSchema = require("./Secondarycontent.Model");

const ReportSchema = new Schema(  
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      validate: {
        validator(title) {
          return validator.stripLow(title, false);
        },
        message: "{VALUE} is not a valid title.",
      },
    },
    searching_title: {
      type: String,
      trim: true,
    },
    title_prefix: { type: String, default: null },
    title_suffix: { type: String, default: "market" },
    category: {
      type: String,
      enum: Object.values(DATA_CONSTANTS.REPORT_CATEGORY),
      required: [true, "Report Category is required"],
    },
    vertical: {
      type: String,
      // required: [true, 'Report Vertical is required'],
      trim: true,
      index: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      required: [true, "Owner details are required"],
      trim: true,
      ref: "users",
    },
    approver: {
      type: Schema.Types.ObjectId,
      trim: true,
      ref: "users",
    },
    approved: {
      type: Schema.Types.Boolean,
      default: false,
    },
    pdfLink: {
      type: String,
      trim: true,
    },
    excelLink: {
      type: String,
      trim: true,
    },
    docLink: {
      type: String,
      trim: true,
    },
    isPdf: {
      type: Schema.Types.Boolean,
      default: false,
    },
    isExcel: {
      type: Schema.Types.Boolean,
      default: false,
    },
    isDoc: {
      type: Schema.Types.Boolean,
      default: false,
    },
    isAnalytics: {
      type: Schema.Types.Boolean,
      default: false,
    },
    status: [
      {
        _id: false,
        main_section_id: { type: Schema.Types.Number, required: true },
        status: { type: Schema.Types.String },
      },
    ],
    titles: [
      {
        _id: false,
        title: { type: Schema.Types.String },
        type: { type: Schema.Types.String },
        id: { type: Schema.Types.String },
        key: { type: Schema.Types.String },
      },
    ],
    me: MarketEstimationSchema.schema, // market estimation data
    toc: [TableOfContentSchema.schema], // list of table of contents data,
    cp: [
      {
        company_name: { type: Schema.Types.String, required: true },
        company_id: {
          type: Schema.Types.ObjectId,
          ref: "company_profiles",
          trim: true,
          required: true,
        },
        swot_analysis: [
          {
            _id: false,
            key: {
              type: Schema.Types.String,
              enum: Object.values(DATA_CONSTANTS.SWOT_ANALYSIS),
              required: true,
            },
            value: [
              {
                _id: false,
                index_id: {
                  type: Schema.Types.String,
                },
                name: {
                  type: Schema.Types.String,
                  trim: true,
                },
              },
            ],
          },
        ],
        company_overview: [SecondaryContentSchema.schema],
        key_development: [SecondaryContentSchema.schema],
        strategy: [SecondaryContentSchema.schema],
      },
    ],
    tocList: { type: Schema.Types.Mixed },
    overlaps: [
      {
        section_name: Schema.Types.String,
        data: [
          {
            report_id: {
              type: Schema.Types.ObjectId,
              ref: "reports",
              trim: true,
              required: true,
            },
            report_name: Schema.Types.String,
          },
        ],
      },
    ],
    youtubeContents: [
      {
        imgUrl: Schema.Types.String,
        videoid: Schema.Types.String,
        title: Schema.Types.String,
        publishedAt: Schema.Types.String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Reports = mongoose.model("reports", ReportSchema);
console.log("Exporting Reports model:", Reports);

module.exports = Reports;