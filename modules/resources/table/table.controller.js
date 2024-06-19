import HTTPStatus from 'http-status';
import utilities from '../../../utilities/utils';

const tableService = require('./table.service');

export async function getTableData(req, res) {
    try {
        let reportId = null;
        if (req.params['rid']) {
            // path variable data
            reportId = req.params['rid'];
        } 
        const tabSearchName = req.query['q'];

        const tabData = await tableService.getTableData(reportId, tabSearchName) || {};
        if (!utilities.isEmpty(tabData.errors)) {
            const errObj = tabData.errors;
            return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, errObj, res);
        } else {
            return utilities.sendResponse(HTTPStatus.OK, tabData, res);
        }

    } catch (er) {
        return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, er, res);
    }
}