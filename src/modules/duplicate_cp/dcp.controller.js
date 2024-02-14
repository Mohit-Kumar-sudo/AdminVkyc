import dcpService from './dcp.service';
import utilities from '../../utilities/utils';
import HTTPStatus from 'http-status';

export async function getDuplicateCP(req, res) {
    try {
        const dcpData = await dcpService.getDuplicateCP() || {};
        if (!utilities.isEmpty(dcpData.errors)) {
            const errObj = dcpData.errors;
            return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
        } else {
            return utilities.sendResponse(HTTPStatus.OK, dcpData, res);
        }

    } catch (er) {
        return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}

export async function addSelected(req, res) {
    try {
        const cpData = req.body
        const cpId = req.params['cpId']
        const dcpData = await dcpService.addSelected(cpData,cpId) || {};
        if (!utilities.isEmpty(dcpData.errors)) {
            const errObj = dcpData.errors;
            return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
        } else {
            return utilities.sendResponse(HTTPStatus.OK, dcpData, res);
        }

    } catch (er) {
        return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}