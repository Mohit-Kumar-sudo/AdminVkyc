import Joi from 'joi';

export default {
    savePrefsData: {
        options: {
            contextRequest: true
        },
        query: {
            uid : Joi.string().required(),
            rid: Joi.string().optional(),
            viewKey: Joi.string().required()
        },
        body: { 
            dashboardType: Joi.string(),
            selectedTab: Joi.string(),
            selectedReport: Joi.string(),
            selectedCompany: Joi.string(),
            selectedSegments: Joi.array().items(Joi.string()).min(1),
            selectedYears: Joi.array().items(Joi.number()).min(1),
            selectedRegions: Joi.array().items(Joi.string()).min(1),
            selectedCountries: Joi.array().items(Joi.string()).min(1)
        },
    },
    getPrefsData: {
        options: {
            contextRequest: true
        },
        query: {
            uid : Joi.string().required(),
            rid: Joi.string().optional(),
            viewKey: Joi.string().required()
        },
        param: {
        },
    }
};
