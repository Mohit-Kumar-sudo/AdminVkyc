import mongoose from 'mongoose';
import statusSchema from './rs.schema';
const statusModel = mongoose.model('reportStatus', statusSchema);

const addReportStatus = function (data, id) {
    const queryPromise = statusModel.updateOne(
        { report_id: id },
        { status: data },
        { upsert: true }
    );
    return queryPromise;
}
const getReportStatus = function (id) {
    const queryPromise = statusModel.findOne({ report_id: id });
    return queryPromise;
}

const updateReportStatus = function (data, id) {
    console.log(data);
    
    const queryPromise = statusModel.updateMany(
        { report_id: id,  "status.main_section_id": data.section_id },
        {$set : {"status.$.status" : data.status}},
    );
    return queryPromise;
}
module.exports = { addReportStatus, getReportStatus, updateReportStatus }