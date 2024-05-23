import mongoose, { Schema } from 'mongoose';

const secCikModel = new Schema({
    cik: { type: Schema.Types.String, required: true },
    title: { type: Schema.Types.String },
    data: { type: Schema.Types.Array, required: true },
    jsonData: { type: Schema.Types.Array }
});

module.exports = mongoose.model('secCikModel', secCikModel);