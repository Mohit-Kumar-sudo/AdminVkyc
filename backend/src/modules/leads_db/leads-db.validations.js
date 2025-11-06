import Joi from 'joi';

export default {
    addNewLead: {
        options: {
            contextRequest: true,
        },
        body: {
            company: Joi.string().required(),
        }
    },
    getLeadDetails: {
        options: {
            contextRequest: true,
        },
        param: {
            lid: Joi.string().alphanum().optional()
        },
        body: {}
    },
    addLeadsData: {
        options: {
            contextRequest: true,
        },
        param: {
            company_id: Joi.string().alphanum().required()
        },
        body: Joi.array().items(Joi.object().keys(
            {
                first_name: Joi.string().required(),
                last_name: Joi.string().required().allow(null),
                email: Joi.string().required(),
                designation: Joi.string().required(),
                country: Joi.string().optional().allow(null),
            }
        )).min(1)
    }
};