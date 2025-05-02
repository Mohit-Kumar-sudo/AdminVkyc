import { mongoose, Schema } from 'mongoose';

const leadsSchema = new Schema({
    'industry_vertical': { type: Schema.Types.String },
    'company': { type: Schema.Types.String, required: true },
    'leads': [{
        first_name: { type: Schema.Types.String },
        last_name: { type: Schema.Types.String },
        email: { type: Schema.Types.String },
        designation: { type: Schema.Types.String },
        country: { type: Schema.Types.String },
        company_name: { type: Schema.Types.String },
    }]
});

module.exports = leadsSchema;