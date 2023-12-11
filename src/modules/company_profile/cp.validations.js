import Joi from 'joi';
import DATA_CONSTANTS from '../../config/dataConstants';

export default {
    addNewCompany: {
        options: {
            contextRequest: true,
        },
        body: {
            company_name: Joi.string().required(),
            vertical: Joi.string().required()
        }
    },
    addCompanyOverview: {
        options: {
            contextRequest: true,
        },
        param: {
            cid: Joi.string().alphanum().required()
        },
        body: Joi.array().items(Joi.object().keys({
            order_id: Joi.number().required(),
            type: Joi.string().required(),
            data: Joi.object().required()
        })).min(1)
    },
    addFinancialOverview: {
        options: {
            contextRequest: true,
        },
        param: {
            cid: Joi.string().alphanum().required()
        },
        body: Joi.array().items(Joi.object().keys({
            key: Joi.string().valid(Object.values(DATA_CONSTANTS.FINANCIAL_KEYS)).required(),
            brkup_no: Joi.number().required(),
            from_year: Joi.number().required(),
            to_year: Joi.number().required(),
            currency: Joi.string().valid(Object.values(DATA_CONSTANTS.CURRENCY)),
            metric: Joi.string().valid(Object.values(DATA_CONSTANTS.CURRENCY_UNIT)),
        }))
    },
    addProductOfferings: {
        options: {
            contextRequest: true,
        },
        param: {
            cid: Joi.string().alphanum().required()
        },
        body: Joi.array().items(Joi.object().keys(
            {
                name: Joi.string().required(),
                id: Joi.string().required(),
                parentId: Joi.string().required().allow(null),
                level: Joi.number().optional(),
                relationship: Joi.string()
            }
        )).min(1)
    },
    addSwotAnalysis: {
        options: {
            contextRequest: true,
        },
        param: {
            cid: Joi.string().alphanum().required()
        },
        body: Joi.array().items(Joi.object().keys({
            key: Joi.string().valid(Object.values(DATA_CONSTANTS.SWOT_ANALYSIS)).required(),
            value: Joi.array().items(Joi.object().keys({
                index_id: Joi.number().required(),
                name: Joi.string().required()
            })).optional()
        }))
    },
    addKeyDevelopments: {
        options: {
            contextRequest: true,
        },
        param: {
            cid: Joi.string().alphanum().required()
        },
        body: Joi.array().items(Joi.object().keys({
            order_id: Joi.number().required(),
            type: Joi.string().required(),
            data: Joi.object().required()
        })).min(1)
    },
    addStrategyInfo: {
        options: {
            contextRequest: true
        },
        param: {
            cid: Joi.string().alphanum().required()
        },
        body: Joi.array().items(Joi.object().keys({
            order_id: Joi.number().required(),
            type: Joi.string().required(),
            data: Joi.object().required()
        })).min(1)
    },
    getCompanyDetails: {
        options: {
            contextRequest: true,
        },
        param: {
            cid: Joi.string().alphanum().optional()
        },
        body: {}
    },
    getFinancialOverview: {
        options: {
            contextRequest: true,
        },
        param: {
            cid: Joi.string().alphanum().required()
        }
    },
    getProductOfferings: {
        options: {
            contextRequest: true,
        },
        param: {
            cid: Joi.string().alphanum().required()
        },
        query: {}
    },
    deleteCompany: {
        options: {
            contextRequest: true
        },
        param: {
            cid: Joi.string().alphanum().required()
        },
        body: {}
    }
};