const mongoose = require('mongoose');
const { Schema, SchemaTypes } = mongoose;
const SecondaryContentSchema = require('./Secondarycontent.Model');
const DATA_CONSTANTS = require('../config/dataConstants');
const uniqueValidator = require('mongoose-unique-validator');

// Market Estimation schema
const CompanyProfileSchema = new Schema(
    {
        company_name: { type: Schema.Types.String, required: true, unique: true },
        vertical: { type: Schema.Types.String, required: true },
        company_overview: [SecondaryContentSchema.schema],
        key_development: [SecondaryContentSchema.schema],
        strategy: [SecondaryContentSchema.schema],
        product_offering: [{
            _id: false,
            name: {
                type: SchemaTypes.String,
                required: [true, 'Segment name is required'],
                trim: true
            },
            id: {
                type: SchemaTypes.String,
                required: [true, 'Segment Identifier (#) is required'],
                trim: true
            },
            parentId: {
                type: SchemaTypes.String,
            },
            relationship: {
                type: SchemaTypes.String,
            },
            level: {
                type: SchemaTypes.Number
            }
        }],
        swot_analysis: [{
            _id: false,
            key: {
                type: Schema.Types.String,
                enum: Object.values(DATA_CONSTANTS.SWOT_ANALYSIS),
                required: true
            },
            value: [{
                _id: false,
                index_id: {
                    type: Schema.Types.String,
                },
                name: {
                    type: Schema.Types.String,
                    trim: true,
                }
            }]
        }],
        financial_overview: [
            {
                _id: false,
                key: {
                    type: Schema.Types.String,
                    enum: Object.values(DATA_CONSTANTS.SWOT_ANALYSIS),
                    required: true
                },
                name: { type: Schema.Types.String, required: true },
                brkup_no: { type: Schema.Types.Number, required: true },
                from_year: { type: Schema.Types.Number, required: true },
                to_year: { type: Schema.Types.Number, default: (new Date()).getFullYear() },
                currency: { type: Schema.Types.String, enum: Object.values(DATA_CONSTANTS.CURRENCY), default: DATA_CONSTANTS.CURRENCY.USD },
                metric: { type: Schema.Types.String, enum: Object.values(DATA_CONSTANTS.CURRENCY_UNIT), default: DATA_CONSTANTS.CURRENCY_UNIT.MN },
                key_data: { type: Schema.Types.Mixed },
                content: { type: Schema.Types.Mixed }
            }
        ],
        status: {
            type: SchemaTypes.String,
            enum: Object.values(DATA_CONSTANTS.COMPANY_STATUS),
            default: DATA_CONSTANTS.COMPANY_STATUS.DATA_INCOMPLETE
        },
        analysts: {
            type: Schema.Types.ObjectId,
            required: [true, 'Owner details are required'],
            trim: true,
            ref: 'users'
        },
        inter_connect:{
            leads:{type:Schema.Types.String},
            filings:{type:Schema.Types.String},
            stocks:{
                name:{type:Schema.Types.String},
                ticker:{type:Schema.Types.String}
            }
        },
        lead_suggest:[],
        filing_suggest:[]
    },
    {
        timestamps: true,
    }
);

// Ensure virtual fields are serialised.
CompanyProfileSchema.set('toJSON', { virtuals: true });
CompanyProfileSchema.set('toObject', { virtuals: true });
CompanyProfileSchema.plugin(uniqueValidator, {
    message: 'Company with name "{VALUE}" aleady exists.',
});

// Exporting Schema
module.exports = CompanyProfileSchema;