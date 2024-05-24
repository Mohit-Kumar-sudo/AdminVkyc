import { mongoose, Schema } from 'mongoose';

const duplicate_cps = new Schema([{
    "_id": false,
    "cp_id": { type: Schema.Types.String },
    "cp_name": { type: Schema.Types.String },
    "duplicates": [{
        "cp_id": { type: Schema.Types.String },
        "cp_name": { type: Schema.Types.String },
        "isDuplicate": { type: Schema.Types.Boolean },
        "selected":{type:Schema.Types.Number}
    }],
    "isCompleted": { type: Schema.Types.Boolean },
}]);

module.exports = duplicate_cps;