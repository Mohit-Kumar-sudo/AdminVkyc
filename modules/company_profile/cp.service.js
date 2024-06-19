import utilities from '../../utilities/utils';
import to from '../../utilities/to';    // for better error handling of async/await with promises 
import cpModel from '../company_profile/cp.model';
import reportModel from '../reports/report.model';
import DATA_CONSTANTS from '../../config/dataConstants';
import csv from 'csv-parser';
import fs from 'fs';


async function addNewCompany(coData, userId) {
    let resData = {};
    try {
        resData = await to(cpModel.addNewCompany(coData, userId));
        return resData;
    } catch (er) {
        console.error(`Exception in  adding new company data. \n : ${er}`);
        return (resData.errors = er.message);
    }
}

async function addCompanyOverview(coData, cpId) {
    let resData = {};
    try {
        resData = await to(reportModel.addCompanyOverview(coData, cpId));
        if (!resData.errors)
            resData = utilities.formUpdateQueryResults(resData);
        return resData;
    } catch (er) {
        console.error(`Exception in  adding company overview data for company (${cpId}) : ${er}`);
        return (resData.errors = er.message);
    }
}

async function addFinancialOverview(foData, cpId) {
    let resData = {};
    try {
        resData = await to(cpModel.addFinancialOverview(foData, cpId));
        if (!resData.errors)
            resData = utilities.formUpdateQueryResults(resData);
        return resData;
    } catch (er) {
        console.error(`Exception in  adding Financial overview data for company (${cpId}) : ${er}`);
        return (resData.errors = er.message);
    }
}


async function addProductOfferings(poData, cpId) {
    let resData = {};
    try {
        resData = await to(cpModel.addProductOfferings(poData, cpId));
        if (!resData.errors)
            resData = utilities.formUpdateQueryResults(resData);
        return resData;
    } catch (er) {
        console.error(`Exception in  adding product offerings data for company (${cpId}) : ${er}`);
        return (resData.errors = er.message);
    }
}

async function addSwotAnalysis(saData, cpId) {
    let resData = {};
    try {
        resData = await to(reportModel.addSwotAnalysis(saData, cpId));
        if (!resData.errors)
            resData = utilities.formUpdateQueryResults(resData);
        return resData;
    } catch (er) {
        console.error(`Exception in  adding SWOT Analysis data for company (${cpId}) : ${er}`);
        return (resData.errors = er.message);
    }
}

async function addKeyDevelopments(kdData, cpId) {
    let resData = {};
    try {
        resData = await to(reportModel.addKeyDevelopments(kdData, cpId));
        if (!resData.errors)
            resData = utilities.formUpdateQueryResults(resData);
        return resData;
    } catch (er) {
        console.error(`Exception in  adding Key Developments data for company (${cpId}) : ${er}`);
        return (resData.errors = er.message);
    }
}


async function addStrategyInfo(stData, cpId) {
    let resData = {};
    try {
        resData = await to(reportModel.addStrategyInfo(stData, cpId));
        if (!resData.errors)
            resData = utilities.formUpdateQueryResults(resData);
        return resData;
    } catch (er) {
        console.error(`Exception in  adding company overview data for company (${cpId}) : ${er}`);
        return (resData.errors = er.message);
    }
}


// GETTERS
async function getCompanyDetails(cpId, selectKeys, cName) {
    let res = {};

    try {
        res = await cpModel.getCompanyDetails(cpId, selectKeys, cName);
    } catch (er) {
        console.error(`Exception in  getting company overview data for company (${cpId}) : ${er}`);
        res['errors'] = er.message;
    }

    return (res);
}

async function deleteCompany(companyId) {
    let res = {};

    try {
        res = await cpModel.deleteCompany(companyId);
    } catch (er) {
        console.error(`Exception in  deleting company (${cpId}) details : ${er}`);
        res['errors'] = er.message;
    }

    return (res);
}

async function interConnect(icData) {
    let resData = {};
    try {
        resData = await to(cpModel.interConnect(icData));
        if (!resData.errors)
            resData = utilities.formUpdateQueryResults(resData);
        return resData;
    } catch (er) {
        console.error(`Exception in  updating interconnect (${cpId}) : ${er}`);
        return (resData.errors = er.message);
    }
}

async function leadsSuggest(data) {
    let resData = {};
    try {
        resData = await to(cpModel.leadsSuggest(data));
        if (!resData.errors)
            resData = utilities.formUpdateQueryResults(resData);
        return resData;
    } catch (er) {
        console.error(`Exception in  updating interconnect (${data.companyId}) : ${er}`);
        return (resData.errors = er.message);
    }
}

async function filingSuggest(data) {
    let resData = {};
    try {
        resData = await to(cpModel.filingSuggest(data));
        if (!resData.errors)
            resData = utilities.formUpdateQueryResults(resData);
        return resData;
    } catch (er) {
        console.error(`Exception in  updating interconnect (${data.companyId}) : ${er}`);
        return (resData.errors = er.message);
    }
}


// export methods
module.exports = {
    addNewCompany,
    addCompanyOverview,
    addFinancialOverview,
    addProductOfferings,
    addSwotAnalysis,
    addKeyDevelopments,
    addStrategyInfo,
    deleteCompany,
    getCompanyDetails,
    interConnect,
    leadsSuggest,
    filingSuggest
};