import mongoose, { Schema } from 'mongoose';

// Market Estimation schema
const SecondaryContentSchema = new Schema(
{
    order_id: {type: Schema.Types.Number},
    type: {type: Schema.Types.String},
    source:  {type: Schema.Types.String},
    title: {type: Schema.Types.String},
    data: {type: Schema.Types.Mixed}
});

SecondaryContentSchema.methods = {

};


// Exporting Schema
module.exports = mongoose.model('sc', SecondaryContentSchema);