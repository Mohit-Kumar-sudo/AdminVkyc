import HTTPStatus from 'http-status';
import utilities from '../../../utilities/utils';

const verticalService = require('./verticals.service');

export async function addVertical(req, res) {
    try {
        const verticalDetails = req.body;

        const verticalData = await verticalService.addVertical(verticalDetails) || {};
        if (!utilities.isEmpty(verticalData.errors)) {
            const errObj = verticalData.errors;
            return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
        } else {
            return utilities.sendResponse(HTTPStatus.OK, verticalData, res);
        }

    } catch (er) {
        return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}

// get all verticals or particular vertical based upon id or name
export async function getVerticals (req, res) {
    let verticalId = null;
    let verticalName = null;

    try {
        if (req.params['vid']) {
            // path variable data
            verticalId = req.params['vid'];
        } else {
            verticalName = req.query['name'];
        }
        
        const verticalData = await verticalService.getVerticals(verticalId, verticalName) || {};
        if (!utilities.isEmpty(verticalData.errors)) {
            const errObj = verticalData.errors;
            return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
        } else {
            return utilities.sendResponse(HTTPStatus.OK, verticalData, res);
        }

    } catch (er) {
        return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}

// get all verticals or particular vertical based upon id or name
export async function getDefaultVerticalModulesList (req, res) {
    let category = null;

    try {
        // path variable data
        category = req.query['category'];
        
        const verticalData = await verticalService.getDefaultVerticalModulesList(category) || {};
        if (!utilities.isEmpty(verticalData.errors)) {
            const errObj = verticalData.errors;
            return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
        } else {
            return utilities.sendResponse(HTTPStatus.OK, verticalData, res);
        }

    } catch (er) {
        return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}