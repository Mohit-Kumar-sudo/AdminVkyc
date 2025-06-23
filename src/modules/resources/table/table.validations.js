import Joi from 'joi';

export default {
    getTableData: {
        options: {
            contextRequest: true
        },
        query: {
            q : Joi.string().required()
        },
        param: {
            rid: Joi.string()
        },
    }
};
