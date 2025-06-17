import mongoose from 'mongoose';
import duplicate_cps from './dcp.schema';
const duplicate_cp = mongoose.model('duplicate_cps', duplicate_cps);

const getDuplicateCP = ()=>{
    const query = duplicate_cp.find()
    return (query.lean().exec({ "virtuals": true }));
} 

const addSelected = function (cpData, cpID) {
    const queryPromise = duplicate_cp.update(
        { "cp_id": mongoose.Types.ObjectId(cpID) },
        { 'duplicates': cpData.duplicates, 'isCompleted':cpData.isCompleted},
        { new: true, setDefaultsOnInsert: true }
    );

    return queryPromise;
}
module.exports = {
    getDuplicateCP,
    addSelected
}