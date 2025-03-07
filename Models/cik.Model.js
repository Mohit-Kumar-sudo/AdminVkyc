const mongoose = require('mongoose');
const { Schema, SchemaTypes } = mongoose;

const cikCompany = new Schema({
    title: { type: Schema.Types.String },
    cik_str: { type: Schema.Types.Number },
    ticker: { type: Schema.Types.String }
});

module.exports = mongoose.model('cikCompany', cikCompany);