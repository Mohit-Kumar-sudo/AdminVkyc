import Joi from 'joi';

export default {
    addVertical: {
        options: {
            contextRequest: true,
        },
        body: {
            name: Joi.string().required(),
            toc: Joi.array().items(Joi.object().keys(
                {
                    section_id: Joi.number().required(),
                    section_name: Joi.string().required(),
                    is_main_section_only: Joi.boolean().required()
                })
            )
        }
    },
    getVerticals: {
        options: {
            contextRequest: true
        },
        query: {
            name: Joi.string().optional()
        },
        param: {
            vid: Joi.string().optional()
        },
    },
    getDefaultVerticalModulesList: {
        options: {
            contextRequest: true
        },
        query: {
            category: Joi.string().optional()
        }
    }
};
