import Joi from 'joi';
import DATA_CONSTANTS from '../../config/dataConstants';

export default {
    addSegments: {
        options: {
            contextRequest: true,
        },
        param: {
            rid: Joi.string().alphanum().required()
        },
        body: Joi.array().items(Joi.object().keys(
                {
                    name: Joi.string().required(),
                    id: Joi.string().required(),
                    pid: Joi.string().required().allow(null)
                }
            )).min(1)
        },
    addMEData: {
        options: {
            contextRequest: true,
        },
        param: {
            rid: Joi.string().alphanum().required()
        },
        /* body: Joi.array().items(Joi.object().keys(
                {
                    name: Joi.string().required(),
                    id: Joi.string().required(),
                    pid: Joi.string().required().allow(null)
                }
            ))
        },*/
    },
    getMEData: {
        options: {
            contextRequest: true,
        },
        param: {
            rid: Joi.string().alphanum().required()
        },
        query: Joi.object({
            metric: Joi.number().required(),
            startYear: Joi.number().optional(),
            endYear: Joi.number().optional(),
        }).with('startYear', ['endYear'])
    },
    addMEGeoData: {
        options: {
            contextRequest: true,
        },
        param: {
            rid: Joi.string().alphanum().required()
        },
        body: Joi.array().items(Joi.object().keys(
            {
                id: Joi.string().required(),
                countries: Joi.array().required(),
                region: Joi.string().required()
            })
        )
    },
    getMEViewsData: {
        options: {
            contextRequest: true,
        },
        param: {
            rid: Joi.string().alphanum().required()
        },
        query: Joi.object({
            key: Joi.string().valid(Object.values(DATA_CONSTANTS.ME_VIEWS)).required(),
            value: Joi.string().optional(),
            mainSectionId: Joi.string().optional(),
            sectionPid: Joi.string().optional(),
        })
    },
    saveDataForGridTables: {
        options: {
            contextRequest: true,
        },
        param: {
            rid: Joi.string().alphanum().required()
        },
        body: Joi.array().items(Joi.object({
            key: Joi.string().required(),
            // text: Joi.string().required()
        }))
    }
};
