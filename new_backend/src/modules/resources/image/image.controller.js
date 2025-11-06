import HTTPStatus from 'http-status';
import utilities from '../../../utilities/utils';

const imageService = require('./image.service');


export async function getImageData (req, res) {
    try {
        let reportId = null;
        if (req.params['rid']) {
            // path variable data
            reportId = req.params['rid'];
        } 
        // query string variable data
        let imageSearchName = req.query['q'];
        
        const imageData = await imageService.getImageData(reportId, imageSearchName) || {};
        if (!utilities.isEmpty(imageData.errors)) {
            const errObj = imageData.errors;
            return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
        } else {
            return utilities.sendResponse(HTTPStatus.OK, imageData, res);
        }

    } catch (er) {
        return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}