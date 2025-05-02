import { mongoose, Schema } from 'mongoose';

const statusSchema = new Schema([{
    report_id: { type: Schema.Types.String, required: true },
    status: [
        {
            section_id: { type: Schema.Types.String, required: true },
            section_name: { type: Schema.Types.String, required: true },
            main_section_id: { type: Schema.Types.String, required: true },
            section_pid: { type: Schema.Types.String },
            status: { type: Schema.Types.String }
        }
    ]
}]);

module.exports = statusSchema;