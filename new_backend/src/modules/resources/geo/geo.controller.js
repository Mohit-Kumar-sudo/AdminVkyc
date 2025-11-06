import HTTPStatus from 'http-status';
import utilities from '../../../utilities/utils';

const geoService = require('./geo.service');

export async function addRegions(req, res) {
    try {
        const regionDetails = req.body;

        const geoData = await geoService.addRegions(regionDetails) || {};
        if (!utilities.isEmpty(geoData.errors)) {
            const errObj = geoData.errors;
            return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
        } else {
            return utilities.sendResponse(HTTPStatus.OK, geoData, res);
        }

    } catch (er) {
        return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}

export async function addCountries(req, res) {
    try {
        const regionId = req.params['rid'];
        const countriesDetails = req.body;

        const geoData = await geoService.addCountries(countriesDetails, regionId) || {};
        if (!utilities.isEmpty(geoData.errors)) {
            const errObj = geoData.errors;
            return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
        } else {
            return utilities.sendResponse(HTTPStatus.OK, geoData, res);
        }

    } catch (er) {
        return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}

export async function getGeoData (req, res) {
    let regionId, regName, ctryName = null;
    let regDetails = {};

    try {
        if (req.params['rid']) {
            // path variable data
            regDetails.regionId = req.params['rid'];
        } else if (req.query) {
            // query string variable data
            regDetails.regionId = req.query['regId'];
            regDetails.regName = req.query['regName'];
            regDetails.ctryName = req.query['ctryName'];
        }
        
        const geoData = await geoService.getGeoData(regDetails) || {};
        if (!utilities.isEmpty(geoData.errors)) {
            const errObj = geoData.errors;
            return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
        } else {
            return utilities.sendResponse(HTTPStatus.OK, geoData, res);
        }

    } catch (er) {
        return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}