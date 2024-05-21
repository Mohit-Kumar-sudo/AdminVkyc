import prefsModel from './prefs.model';
import utilities from '../../../utilities/utils';
import to from '../../../utilities/to';    // for better error handling of async/await with promises 

async function savePrefsData(prefsData, userId, viewKey, reportId ) {
    let prefsSavedData = {};
    try {
        prefsSavedData = await to(prefsModel.savePrefsData(prefsData, userId, viewKey, reportId));
        if (!prefsSavedData.errors)
            prefsSavedData = prefsSavedData;
        return prefsSavedData;
    } catch (er) {
        console.error(`Saving user preferences data error (${er.message})`);
        return (prefsSavedData.errors = er.message);
    }
}


async function getPrefsData(userId, viewKey, reportId) {
    let prefsData = {};

    try {
        prefsData = await to(prefsModel.getPrefsData(userId, viewKey, reportId));
    } catch(er) {
        console.error(`Exception in getting preferences data for (${userId}, ${viewKey}). Ex: ${er}`);
        prefsData.errors = er.message;
    }

    return (prefsData);
}

module.exports = {
    savePrefsData,
    getPrefsData
};