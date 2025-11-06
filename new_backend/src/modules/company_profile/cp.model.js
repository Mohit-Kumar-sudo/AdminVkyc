import mongoose, { Schema, mongo } from 'mongoose';

// import schemas
import CompanyProfileSchema from './cp.schema';
import utilities from '../../utilities/utils';
const CompanyProfileModel = mongoose.model('company_profiles', CompanyProfileSchema);


const addNewCompany = function (coData, userId) {
    // console.log(coData);
    const obj = {
        "company_name": coData.company_name,
        "vertical": coData.vertical,
        "analysts": userId,
    };
    let cpData = new CompanyProfileModel(obj);

    return cpData.save();
}

const addCompanyOverview = function (coData, cpID) {
    // console.log(JSON.stringify(arr));

    const queryPromise = CompanyProfileModel.update(
        { "_id": mongoose.Types.ObjectId(cpID) },
        { 'company_overview': coData },
        { new: true, setDefaultsOnInsert: true }
    );

    return queryPromise;
}

const addFinancialOverview = function (foData, cpID) {
    const queryPromise = CompanyProfileModel.update(
        { "_id": mongoose.Types.ObjectId(cpID) },
        { 'financial_overview': foData },
        { new: true, setDefaultsOnInsert: true }
    );

    return queryPromise;
}

const addProductOfferings = function (poData, cpID) {
    // console.log(JSON.stringify(arr));

    const queryPromise = CompanyProfileModel.update(
        { "_id": mongoose.Types.ObjectId(cpID) },
        { 'product_offering': poData },
        { new: true, setDefaultsOnInsert: true }
    );

    return queryPromise;
}

const addSwotAnalysis = function (saData, cpID) {
    // console.log(JSON.stringify(arr));

    const queryPromise = CompanyProfileModel.update(
        { "_id": mongoose.Types.ObjectId(cpID) },
        { 'swot_analysis': saData },
        { new: true, setDefaultsOnInsert: true }
    );

    return queryPromise;
}

const addKeyDevelopments = function (kdData, cpID) {

    const queryPromise = CompanyProfileModel.update(
        { "_id": mongoose.Types.ObjectId(cpID) },
        { 'key_development': kdData },
        { new: true, setDefaultsOnInsert: true }
    );

    return queryPromise;
}

const addStrategyInfo = function (stData, cpID) {

    const queryPromise = CompanyProfileModel.update(
        { "_id": mongoose.Types.ObjectId(cpID) },
        { 'strategy': stData },
        { new: true, setDefaultsOnInsert: true }
    );

    return queryPromise;
}

const getCompanyDetails = function (cpID, selectKeys = "", cName) {

    const selKeysArr = selectKeys.split(',');
    const query = CompanyProfileModel.find();

    if (!utilities.isEmpty(cName)) {
        query.where({ "company_name": { "$regex": cName, "$options": "i" } });
    }

    if (!utilities.isEmpty(selKeysArr) && !utilities.isEmpty(selKeysArr[0]))
        query.select(selKeysArr.join(' '));
    // else
    //     query.select('company_name analysts updatedAt status');

    if (!utilities.isEmpty(cpID))
        query.find({ "_id": mongoose.Types.ObjectId(cpID) });

    query.sort({ "updatedAt": -1 });

    return (query.lean().exec({ "virtuals": true }));
}


const deleteCompany = function (companyId) {

    const query = CompanyProfileModel.findByIdAndRemove(companyId);

    return query;
}

const interConnect = function (icData) {
    const queryPromise = CompanyProfileModel.update(
        { "_id": mongoose.Types.ObjectId(icData.companyId) },
        { 'inter_connect': { leads: icData.leads, filings: icData.filings, stocks:{name: icData.stocks, ticker: icData.ticker }} },
        { new: true, setDefaultsOnInsert: true,upsert:true }
    );

    return queryPromise;
}

const leadsSuggest = (data)=>{
    const queryPromise = CompanyProfileModel.update(
        { "_id": mongoose.Types.ObjectId(data.companyId) },
        { 'lead_suggest':data.lead_suggest },
        { new: true, setDefaultsOnInsert: true,upsert:true }
    );
    return queryPromise;
}

const filingSuggest = (data)=>{
    const queryPromise = CompanyProfileModel.update(
        { "_id": mongoose.Types.ObjectId(data.companyId) },
        { 'filing_suggest':data.filing_suggest },
        { new: true, setDefaultsOnInsert: true,upsert:true }
    );
    return queryPromise;
}
// Exporting model to external world
module.exports = {
    addNewCompany,
    addCompanyOverview,
    addFinancialOverview,
    addProductOfferings,
    addSwotAnalysis,
    addKeyDevelopments,
    addStrategyInfo,
    deleteCompany,
    getCompanyDetails,
    interConnect,
    leadsSuggest,
    filingSuggest
};
