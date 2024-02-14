import HTTPStatus from 'http-status';
import utilities from '../../utilities/utils';

const secService = require('./sec.service');

// Add Data API controllers

export async function getParentFiling(req, res) {
    try {

        let cik = req.query.cik || null;
        let company = req.query.company;
        const secData = await secService.getParentFiling(cik, company) || {};
   
        
        if (!utilities.isEmpty(secData.errors)) {
            const errObj = secData.errors;
            // const errObj = utilities.getErrorDetails(report.errors);
            return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
        } else {
           
            
            // return utilities.sendResponse(HTTPStatus.OK, secData, res);
        }

    } catch (er) {
        return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}