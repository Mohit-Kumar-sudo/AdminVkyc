import Joi from 'joi';

export default {
    getImageData: {
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
