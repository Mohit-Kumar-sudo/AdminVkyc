const mongoose = require('mongoose');
const { Schema, SchemaTypes } = mongoose;

const secEdgarSchema = new Schema({
    cik: { type: Schema.Types.String },
    company: { type: Schema.Types.String },
    document: [
        {
            _id: false,
            hashId: { type: Schema.Types.String },
            headings: { type: Schema.Types.String }
        }
    ],
    htmlDoc: { type: Schema.Types.String }
});

module.exports = mongoose.model("secModel", secEdgarSchema);