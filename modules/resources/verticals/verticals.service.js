import verticalModel from './verticals.model';
import utilities from '../../../utilities/utils';
import to from '../../../utilities/to';    // for better error handling of async/await with promises 

async function addVertical(verticalDetails) {
    let verticalData = {};
    try {
        verticalData = await to(verticalModel.addVertical(verticalDetails));
        if (utilities.checkIfMongooseObject(verticalData))
            return verticalData._doc;
        return verticalData;
    } catch (er) {
        verticalData.errors = er;
        return (verticalData);
    }
}

async function getVerticals(verticalId, verticalName) {
    let verticalData = {};

    try {
        verticalData = await to(verticalModel.getVerticals(verticalId, verticalName));
        verticalData = verticalData.filter((ele) => {
            if (ele.name === 'default') {
                return false;
            }
            return true
        });
    } catch(er) {
        verticalData.errors = er;
    }

    return (verticalData);
}

async function getDefaultVerticalModulesList(category) {
    let verticalData = {};

    try {
        verticalData = await to(verticalModel.getDefaultVerticalModulesList(category));
    } catch(er) {
        verticalData.errors = er;
    }

    return (verticalData);
}


module.exports = {
    addVertical,
    getVerticals,
    getDefaultVerticalModulesList
};