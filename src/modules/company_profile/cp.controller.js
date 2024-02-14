import HTTPStatus from 'http-status';
import utilities from '../../utilities/utils';
import csv from 'csv-parser';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import _ from 'lodash';
const cpService = require('./cp.service');

// Add Data API controllers

export async function addNewCompany(req, res) {
    try {
        const coData = req.body;

        const userId = (req.user && req.user.id) || null;

        const cpData = await cpService.addNewCompany(coData, userId) || {};
        if (!utilities.isEmpty(cpData.errors)) {
            const errObj = cpData.errors;
            // const errObj = utilities.getErrorDetails(report.errors);
            return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
        } else {
            return utilities.sendResponse(HTTPStatus.OK, cpData, res);
        }

    } catch (er) {
        return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}

export async function addCompanyOverview(req, res) {
    try {
        const companyId = req.params['cid'];
        const coData = req.body;

        const cpData = await cpService.addCompanyOverview(coData, companyId) || {};
        if (!utilities.isEmpty(cpData.errors)) {
            const errObj = cpData.errors;
            // const errObj = utilities.getErrorDetails(report.errors);
            return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
        } else {
            return utilities.sendResponse(HTTPStatus.OK, cpData, res);
        }

    } catch (er) {
        return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}

export async function addFinancialOverview(req, res) {
    try {
        const companyId = req.params['cid'];
        const foData = req.body;

        const cpData = await cpService.addFinancialOverview(foData, companyId) || {};
        if (!utilities.isEmpty(cpData.errors)) {
            const errObj = cpData.errors;
            // const errObj = utilities.getErrorDetails(report.errors);
            return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
        } else {
            return utilities.sendResponse(HTTPStatus.OK, cpData, res);
        }

    } catch (er) {
        return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}

export async function addProductOfferings(req, res) {
    try {
        const companyId = req.params['cid'];
        const poData = req.body;

        const cpData = await cpService.addProductOfferings(poData, companyId) || {};
        if (!utilities.isEmpty(cpData.errors)) {
            const errObj = cpData.errors;
            // const errObj = utilities.getErrorDetails(report.errors);
            return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
        } else {
            return utilities.sendResponse(HTTPStatus.OK, cpData, res);
        }

    } catch (er) {
        return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}

export async function addSwotAnalysis(req, res) {
    try {
        const companyId = req.params['cid'];
        const saData = req.body;

        const cpData = await cpService.addSwotAnalysis(saData, companyId) || {};
        if (!utilities.isEmpty(cpData.errors)) {
            const errObj = cpData.errors;
            // const errObj = utilities.getErrorDetails(report.errors);
            return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
        } else {
            return utilities.sendResponse(HTTPStatus.OK, cpData, res);
        }

    } catch (er) {
        return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}
export async function addKeyDevelopments(req, res) {
    try {
        const companyId = req.params['cid'];
        const kdData = req.body;

        const cpData = await cpService.addKeyDevelopments(kdData, companyId) || {};
        if (!utilities.isEmpty(cpData.errors)) {
            const errObj = cpData.errors;
            // const errObj = utilities.getErrorDetails(report.errors);
            return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
        } else {
            return utilities.sendResponse(HTTPStatus.OK, cpData, res);
        }

    } catch (er) {
        return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}

export async function addStrategyInfo(req, res) {
    try {
        const companyId = req.params['cid'];
        const stData = req.body;

        const cpData = await cpService.addStrategyInfo(stData, companyId) || {};
        if (!utilities.isEmpty(cpData.errors)) {
            const errObj = cpData.errors;
            // const errObj = utilities.getErrorDetails(report.errors);
            return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
        } else {
            return utilities.sendResponse(HTTPStatus.OK, cpData, res);
        }

    } catch (er) {
        return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}

// Get Data API controllers

export async function getCompanyDetails(req, res) {
    try {
        const cpId = req.params['cid'];
        const selectKeys = req.query['select'] || "";
        const cName = req.query.name || null;

        const cpData = await cpService.getCompanyDetails(cpId, selectKeys, cName) || {};
        if (!utilities.isEmpty(cpData.errors)) {
            const errObj = cpData.errors;
            // const errObj = utilities.getErrorDetails(report.errors);
            return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
        } else {
            return utilities.sendResponse(HTTPStatus.OK, cpData, res);
        }

    } catch (er) {
        return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}

export async function deleteCompany(req, res) {
    try {
        const companyId = req.params['cid'];

        const userId = (req.user && req.user.id) || null;

        const cpData = await cpService.deleteCompany(companyId) || {};
        if (!utilities.isEmpty(cpData.errors)) {
            const errObj = cpData.errors;
            return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
        } else {
            return utilities.sendResponse(HTTPStatus.OK, cpData, res);
        }

    } catch (er) {
        console.error(er);
        return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}

export async function interConnect(req, res) {
    try {
        const icData = req.body;
        const cpData = await cpService.interConnect(icData) || {};
        if (!utilities.isEmpty(cpData.errors)) {
            const errObj = cpData.errors;
            // const errObj = utilities.getErrorDetails(report.errors);
            return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
        } else {
            return utilities.sendResponse(HTTPStatus.OK, cpData, res);
        }

    } catch (er) {
        return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}

export async function importCsvCPtoDB(req, res) {
    try {
        let temp = [];
        let flag = 0;
        const key = ['companyId', 'company', 'leads', 'stocks', 'ticker', 'filings'];
        const directory = 'uploads';
        fs.createReadStream(req.files.csv_file.path)
            .pipe(csv())
            .on('data', async (row) => {
                if (_.isEqual(key, _.keys(row))) {
                    temp.push({
                        companyId: row.companyId,
                        name: row.company,
                        stocks:row.stocks,
                        ticker:row.ticker,
                        leads:row.leads,
                        filings:row.filings
                    })
                    await cpService.interConnect(row);
                }else{
                    flag = 1;
                }
            })
            .on('end', () => {
                if (temp.length) {
                    res.json({ temp })
                }else if(flag){
                    res.json({error:true,msg:`Key mismatched change your csv headers name like this HEADERS : ${key}`});
                }
            })
        fs.readdir(directory, (err, files) => {
            if (err) throw err;

            for (const file of files) {
                fs.unlink(path.join(directory, file), err => {
                    if (err) throw err;
                });
            }
        });
    } catch (er) {
        return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}

export async function sendInterConnects(req, res) {
    const { cps } = req.body;
    console.log('cps--------->', cps)
    if (cps && cps.length) {
        Promise.all(
            cps.map(async d => {
                let val = await cpService.getCompanyDetails(d, "inter_connect,company_name", null);
                if (val && val[0].inter_connect)
                    return val[0];
            })).then(data => {
                if (data && data.length)
                    return utilities.sendResponse(HTTPStatus.OK, _.compact(data), res);
            }).catch(err => {
                return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, err, res);
            })
    }
}

export async function leadsSuggest(req,res){
    try {
        const data = req.body;
        const cpData = await cpService.leadsSuggest(data) || {};
        const icData = await cpService.interConnect(data) || {};
        if (!utilities.isEmpty(cpData.errors) || !utilities.isEmpty(icData.errors)) {
            const errObj = cpData.errors || icData.errors;
            // const errObj = utilities.getErrorDetails(report.errors);
            return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
        } else {
            return utilities.sendResponse(HTTPStatus.OK, {cpData,icData}, res);
        }

    } catch (er) {
        return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }   
}

export async function filingSuggest(req,res){
    try {
        const data = req.body;
        const cpData = await cpService.filingSuggest(data) || {};
        const icData = await cpService.interConnect(data) || {};
        if (!utilities.isEmpty(cpData.errors) || !utilities.isEmpty(icData.errors)) {
            const errObj = cpData.errors || icData.errors;
            // const errObj = utilities.getErrorDetails(report.errors);
            return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
        } else {
            return utilities.sendResponse(HTTPStatus.OK, {cpData,icData}, res);
        }

    } catch (er) {
        return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }   
}