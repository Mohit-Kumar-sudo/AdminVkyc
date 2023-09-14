import dcpModel from './dcp.model';
import to from '../../utilities/to';

async function getDuplicateCP() {
    let resData = {};
    try {
        resData = await to(dcpModel.getDuplicateCP());
        return resData;
    } catch (er) {
        return (resData.errors = er.message);
    }
}

async function addSelected(cpData,cpid) {
    let resData = {};
    try {
        resData = await to(dcpModel.addSelected(cpData,cpid));
        return resData;
    } catch (er) {
        return (resData.errors = er.message);
    }
}

module.exports={
    getDuplicateCP,
    addSelected
}