const {mongoose, Schema } = require('mongoose');

const SecondaryContentSchema = new Schema(
{
    order_id: {type: Schema.Types.Number},
    type: {type: Schema.Types.String},
    source:  {type: Schema.Types.String},
    title: {type: Schema.Types.String},
    data: {type: Schema.Types.Mixed}
});


module.exports = mongoose.model('sc', SecondaryContentSchema);