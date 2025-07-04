import utilities from '../../utilities/utils';
import to from '../../utilities/to';    // for better error handling of async/await with promises 
import reqHistoryModel from './requests_history.model';
// import reportModel from '../reports/report.model';
import DATA_CONSTANTS from '../../config/dataConstants';
import csv from 'csv-parser';
import fs from 'fs';


async function RequestsHistory(historyData, userId) {
    let resData = {};
    try {
        resData = await to(reqHistoryModel.RequestsHistoryData(historyData, userId));
        return resData;
    } catch (er) {
        console.error(`Exception in  adding new History data. \n : ${er}`);
        return (resData.errors = er.message);
    }
}

async function getHistoryReportById(req, res) {
    let resData = {}
    try {
        resData = await to(reqHistoryModel.getHistoryReportById(req, res));
        return resData;
    } catch (er) {
        console.error(`Exception in  adding or updating data in history. \n : ${er}`);
        return (resData.errors = er.message);
    }
}

module.exports = {
    RequestsHistory,    
    getHistoryReportById
};