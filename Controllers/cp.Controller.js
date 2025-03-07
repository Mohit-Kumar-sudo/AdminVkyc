const mongoose = require('mongoose');
const CompanyProfileSchema = require('../Models/company_profile.Model');
const utilities = require('../utilities/utils');
const HTTPStatus = require('http-status');
const _ = require("lodash");
const CompanyProfileModel = mongoose.model('company_profiles', CompanyProfileSchema);

// const getCompanyDetailss = async (req, res) => {
//     try {
//         const cpId = req.params['cid'];
//         const selectKeys = req.query['select'] || "";
//         const cName = req.query.name || null;

//         // Process select keys
//         const selKeysArr = selectKeys ? selectKeys.split(',') : [];

//         // Build query
//         const query = CompanyProfileModel.find();

//         if (!utilities.isEmpty(cName)) {
//             query.where({ "company_name": { "$regex": cName, "$options": "i" } });
//         }

//         if (!utilities.isEmpty(selKeysArr) && !utilities.isEmpty(selKeysArr[0])) {
//             query.select(selKeysArr.join(' '));
//         }

//         if (!utilities.isEmpty(cpId)) {
//             query.find({ "_id": new mongoose.Types.ObjectId(cpId) });
//         }

//         query.sort({ "updatedAt": -1 });

//         // Execute query
//         const cpData = await query.lean().exec({ "virtuals": true }) || {};

//         if (!utilities.isEmpty(cpData.errors)) {
//             return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, cpData.errors, res);
//         }

//         return utilities.sendResponse(HTTPStatus.OK, cpData, res);

//     } catch (error) {
//         console.error(`Error fetching company details: ${error}`);
//         return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, error.message, res);
//     }
// };

module.exports = {
    getCompanyDetails: async (req, res) => {
        try {
            const cpId = req.params['cid'];
            const selectKeys = req.query['select'] || "";
            const cName = req.query.name || null;

            // Process select keys
            const selKeysArr = selectKeys ? selectKeys.split(',') : [];

            // Build query
            const query = CompanyProfileModel.find();

            if (!utilities.isEmpty(cName)) {
                query.where({ "company_name": { "$regex": cName, "$options": "i" } });
            }

            if (!utilities.isEmpty(selKeysArr) && !utilities.isEmpty(selKeysArr[0])) {
                query.select(selKeysArr.join(' '));
            }

            if (!utilities.isEmpty(cpId)) {
                query.find({ "_id": new mongoose.Types.ObjectId(cpId) });
            }

            query.sort({ "updatedAt": -1 });

            // Execute query
            const cpData = await query.lean().exec({ "virtuals": true }) || {};

            if (!utilities.isEmpty(cpData.errors)) {
                return utilities.sendErrorResponse(HTTPStatus.BAD_REQUEST, true, cpData.errors, res);
            }

            return utilities.sendResponse(HTTPStatus.OK, cpData, res);

        } catch (error) {
            console.error(`Error fetching company details: ${error}`);
            return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, error.message, res);
        }
    },
    sendInterConnects: async (req, res) => {
        console.log('Full request body:', req.body); 
        const { cps } = req.body;
        console.log('Received cps:', cps);  
    
        if (!Array.isArray(cps) || cps.length === 0) {
            return utilities.sendResponse(HTTPStatus.BAD_REQUEST, { message: "Invalid input: cps should be a non-empty array" }, res);
        }
    
        try {
            const results = await Promise.all(
                cps.map(async (cpId) => {
                    try {
                        const selectKeys = "inter_connect,company_name";
                        const selKeysArr = selectKeys.split(',');
    
                        const query = CompanyProfileModel.find();
    
                        if (!utilities.isEmpty(selKeysArr) && !utilities.isEmpty(selKeysArr[0])) {
                            query.select(selKeysArr.join(' '));
                        }
    
                        if (!utilities.isEmpty(cpId)) {
                            query.find({ "_id": mongoose.Types.ObjectId(cpId) });
                        }
    
                        query.sort({ "updatedAt": -1 });
    
                        // Restore original query execution
                        const val = await query.lean().exec({ "virtuals": true });
                        console.log('Fetched company details:', val);
    
                        if (val && val[0]?.inter_connect) {
                            return val[0];
                        }
                    } catch (error) {
                        console.error(`Error fetching company details for CP ID (${cpId}): ${error}`);
                    }
                })
            );
    
            if (results.length) {
                return utilities.sendResponse(HTTPStatus.OK, _.compact(results), res);
            }
    
            return utilities.sendResponse(HTTPStatus.NO_CONTENT, [], res);
        } catch (err) {
            return utilities.sendErrorResponse(HTTPStatus.INTERNAL_SERVER_ERROR, true, err, res);
        }
    }
}
