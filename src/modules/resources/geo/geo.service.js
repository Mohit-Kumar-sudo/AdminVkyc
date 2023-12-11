import geoModel from './geo.model';

import to from '../../../utilities/to';    // for better error handling of async/await with promises 

async function addRegions(regionDetails) {
    let geoData = {};
    try {
        geoData = await to(geoModel.addRegion(regionDetails));
        return geoData;
    } catch (er) {
        geoData.errors = er;
        return (geoData);
    }
}

async function addCountries(countryDetails, regionId) {
    let geoData = {};
    try {
        geoData = await to(geoModel.addCountries(countryDetails, regionId));
        return geoData;
    } catch (er) {
        geoData.errors = er;
        return (geoData);
    }
}

async function getGeoData(regionDetails) {
    let geoData = {};

    try {
        geoData = await to(geoModel.getGeoData(regionDetails));
    } catch(er) {
        geoData.errors = er;
    }

    return (geoData);
}

module.exports = {
    addRegions,
    addCountries,
    getGeoData
};