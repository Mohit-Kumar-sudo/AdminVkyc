import to from '../../utilities/to';
import reportAcessModel from './reports_access.model';

async function getReportsList(userId){
    let resData = {};
    try {
        resData = await to(reportAcessModel.getReportsList(userId));
        return resData
    } catch (error) {
        console.error(`Error in getting User Reports List. \n : ${error}`);
        return (resData.errors = error.message);
    }
}

async function addReports(data){
    let resData = {}
    try {
        resData = await to(reportAcessModel.addReports(data))
        return resData
    } catch (error) {
        console.error(`Error in saving User Reports List. \n : ${error}`);
        return (resData.errors = error.message);
    }
}

async function updateReports(data){
    let resData = {}
    try {
        resData = await to(reportAcessModel.updateReports(data));
        return resData
    } catch (error) {
        console.error(`Error in updating User Reports List. \n : ${error}`);
        return (resData.errors = error.message);
    }
}

async function updateCharts(data){
    let resData = {}
    try {
        resData = await to(reportAcessModel.updateCharts(data));
        return resData
    } catch (error) {
        console.error(`Error in updating User Charts List. \n : ${error}`);
        return (resData.errors = error.message);
    }
}

async function addCharts(data){
    let resData = {}
    try {
        resData = await to(reportAcessModel.addCharts(data))
        return resData
    } catch (error) {
        console.error(`Error in saving User Charts List. \n : ${error}`);
        return (resData.errors = error.message);
    }
}

module.exports = {
    getReportsList,
    addReports,
    updateReports,
    addCharts,
    updateCharts
}
