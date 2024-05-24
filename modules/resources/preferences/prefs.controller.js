import HTTPStatus from 'http-status';
import utilities from '../../../utilities/utils';

const prefsService = require('./prefs.service');

export async function savePrefsData(req, res) {
    try {
        let prefsData = req.body;
        let userId = null;
        let reportId = null;

        if (req.query['rid']) {
            reportId = req.query['rid'];
        } 

        if (req.query['uid']) {
            userId = req.query['uid'];
        } else {
            userId = req.user.id;
        }

        let viewKey = req.query['viewKey'];

        const prefsSavedData = await prefsService.savePrefsData(prefsData, userId, viewKey, reportId) || {};
        if (!utilities.isEmpty(prefsSavedData.errors)) {
            const errObj = prefsSavedData.errors;
            return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
        } else {
            return utilities.sendResponse(HTTPStatus.OK, prefsSavedData, res);
        }

    } catch (er) {
        return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}

export async function getPrefsData(req, res) {
    try {
        let userId = null;
        let reportId = null;
        if (!utilities.isEmpty(req.query['rid'])) {
            reportId = req.params['rid'];
        } 

        if (!utilities.isEmpty(req.query['uid'])) {
            userId = req.query['uid'];
        } else {
            userId = req.user.id;
        }

        let viewKey = req.query['viewKey'];

        const prefsData = await prefsService.getPrefsData(userId, viewKey, reportId) || {};
        if (!utilities.isEmpty(prefsData.errors)) {
            const errObj = prefsData.errors;
            return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
        } else {
            return utilities.sendResponse(HTTPStatus.OK, prefsData, res);
        }

    } catch (er) {
        return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}