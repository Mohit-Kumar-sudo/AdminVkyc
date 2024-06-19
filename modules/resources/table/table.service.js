import tableModel from './table.model';

import to from '../../../utilities/to';    // for better error handling of async/await with promises 


async function getTableData(reportId, tableSearchName) {
    let tabData = {};

    try {
        tabData = await to(tableModel.getTableData(reportId, tableSearchName));
    } catch(er) {
        console.error(`Exception in getting table data by name for (${reportId}, ${tableSearchName}). Ex: ${er}`);
        tabData.errors = er.message;
    }

    return (tabData);
}

module.exports = {
    getTableData
};