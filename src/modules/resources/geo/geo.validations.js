import Joi from 'joi';

export default {
    addCountries: {
        options: {
            contextRequest: true,
        },
        param: {
            rid: Joi.string().alphanum().required()
        },
        body: Joi.array().items(Joi.object().keys(
            {
                name: Joi.string().required()
            })
        )
    },
    addRegions: {
        options: {
            contextRequest: true,
        },
        body: Joi.array().items(Joi.object().keys(
            {
                region: Joi.string().required()
            })
        )
    },
    getGeoData: {
        options: {
            contextRequest: true
        },
        query: {
            regId: Joi.string(),
            regName: Joi.string(),
            ctryName: Joi.string()
        },
        param: {
            rid: Joi.string()
        },
    }
};
