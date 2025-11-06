import Joi from 'joi';

export default {
    getChartData: {
        options: {
            contextRequest: true
        },
        query: {
            q: Joi.string().required()
        },
        param: {
            rid: Joi.string().optional()
        },
    }
};
