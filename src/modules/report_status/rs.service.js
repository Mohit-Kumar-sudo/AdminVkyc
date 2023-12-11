import statusModel from './rs.model';
import to from '../../utilities/to';

async function addReportStatus(data, id) {
    let resData = {};
    try {
        resData = await to(statusModel.addReportStatus(data, id));
        return resData;
    } catch (er) {
        console.error(`Exception in  adding or updating data in daily intra day stocks. \n : ${er}`);
        return (resData.errors = er.message);
    }
}

async function getReportStatus(id) {
    let resData = {};
    try {
        resData = await to(statusModel.getReportStatus(id));
        return resData;
    } catch (er) {
        console.error(`Exception. \n : ${er}`);
        return (resData.errors = er.message);
    }
}

async function updateReportStatus(data, id) {
    let resData = {};
    try {
        resData = await to(statusModel.updateReportStatus(data, id));
        return resData;
    } catch (er) {
        console.error(`Exception. \n : ${er}`);
        return (resData.errors = er.message);
    }
}
module.exports = {
    addReportStatus,
    getReportStatus,
    updateReportStatus
}