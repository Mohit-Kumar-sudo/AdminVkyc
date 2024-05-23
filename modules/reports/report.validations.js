import Joi from 'joi';
import DATA_CONSTANTS from '../../config/dataConstants';

export default {
    createReport: {
        body: {
            title: Joi.string()
                .required(),
            vertical: Joi.string() 
                .required(),
            category: Joi.string()
                .required(),
            me: Joi.object().keys({
                start_year: Joi.number()
                    .required(),
                end_year: Joi.number()
                    .required(),
                base_year: Joi.number()
                    .required()
            }),
            tocList: Joi.array().required()
        },
        failAction(request, reply, source, error) {
            console.log(error);
            return reply({ message: error.output.payload.message });
        }
    },
    fetchReport: {
        options: {
            contextRequest: true,
        },
        param: {
            rid: Joi.string().alphanum().required()
        },
        query: {
            name: Joi.string()
        },
        failAction(request, reply, source, error) {
            console.log(error);
            return reply({ message: error.output.payload.message });
        }
    },
    addNewCustomModule: {
        options: {
            contextRequest: true,
        },
        param: {
            rid: Joi.string().alphanum().required()
        },
        body: {
            section_name: Joi.string().required(),
            section_id:  Joi.number().required(),
            /* urlpattern: Joi.string().required(),
            section_key: Joi.string().required() */
        },
        failAction(request, reply, source, error) {
            console.log(error);
            return reply({ message: error.output.payload.message });
        }
    },
    addCompanyProfileData: {
        options: {
            contextRequest: true,
        },
        param: {
            rid: Joi.string().alphanum().required()
        },
        body: Joi.array().items(Joi.object().keys({
            company_name: Joi.string().required(),
            company_id:  Joi.string().alphanum().required(),
        })),
        failAction(request, reply, source, error) {
            console.log(error);
            return reply({ message: error.output.payload.message });
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
    }
};


