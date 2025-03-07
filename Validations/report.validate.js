const Joi = require('joi');
const dataConstants = require('../config/dataConstants');

const createReport = Joi.object({
    title: Joi.string().required(),
    vertical: Joi.string().required(),
    category: Joi.string().required(),
    me: Joi.object({
        start_year: Joi.number().required(),
        end_year: Joi.number().required(),
        base_year: Joi.number().required(),
    }).required(),
    tocList: Joi.array().required(),
});

const fetchReport = Joi.object({
    rid: Joi.string().alphanum().required(),
    name: Joi.string().optional(),
});

const addNewCustomModule = Joi.object({
    rid: Joi.string().alphanum().required(),
    section_name: Joi.string().required(),
    section_id: Joi.number().required(),
    // Uncomment and add additional fields if needed
    // urlpattern: Joi.string().required(),
    // section_key: Joi.string().required(),
});

const addCompanyProfileData = Joi.object({
    rid: Joi.string().alphanum().required(),
    body: Joi.array().items(Joi.object({
        company_name: Joi.string().required(),
        company_id: Joi.string().alphanum().required(),
    })).required(),
});

const addCompanyOverview = Joi.object({
    cid: Joi.string().alphanum().required(),
    body: Joi.array().items(Joi.object({
        order_id: Joi.number().required(),
        type: Joi.string().required(),
        data: Joi.object().required(),
    })).min(1).required(),
});

const addSwotAnalysis = Joi.object({
    cid: Joi.string().alphanum().required(),
    body: Joi.array().items(Joi.object({
        key: Joi.string().valid(...Object.values(dataConstants.SWOT_ANALYSIS)).required(),
        value: Joi.array().items(Joi.object({
            index_id: Joi.number().required(),
            name: Joi.string().required(),
        })).optional(),
    })).required(),
});

const addKeyDevelopments = Joi.object({
    cid: Joi.string().alphanum().required(),
    body: Joi.array().items(Joi.object({
        order_id: Joi.number().required(),
        type: Joi.string().required(),
        data: Joi.object().required(),
    })).min(1).required(),
});

const addStrategyInfo = Joi.object({
    cid: Joi.string().alphanum().required(),
    body: Joi.array().items(Joi.object({
        order_id: Joi.number().required(),
        type: Joi.string().required(),
        data: Joi.object().required(),
    })).min(1).required(),
});

module.exports = {
    createReport,
    fetchReport,
    addNewCustomModule,
    addCompanyProfileData,
    addCompanyOverview,
    addSwotAnalysis,
    addKeyDevelopments,
    addStrategyInfo,
};
