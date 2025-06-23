import Joi from 'joi';
import DATA_CONSTANTS from '../../config/dataConstants';

export default {
    addContent: {
        options: {
            contextRequest: true,
        },
        param: {
            rid: Joi.string().alphanum().required()
        },
        body: Joi.array().items(Joi.object().keys(
                {
                    section_name: Joi.string().required(),
                    main_section_id: Joi.number().required(),
                    section_id: Joi.string().required(),
                    section_pid: Joi.string().optional().allow(null),
                    content: Joi.array(),
                    meta: Joi.object().keys({
                        type: Joi.string().valid(Object.values(DATA_CONSTANTS.MODULES_META_TYPE)).required()
                    })
                    /* texts: Joi.array().items(Joi.string()),
                    tables: Joi.array().items(Joi.object().keys({
                        id: Joi.string().required(),
                        title: Joi.string().required(),
                        data: Joi.object().required(),
                        source: Joi.string().optional(),
                        text: Joi.string().optional()
                    })),
                    images: Joi.array().items(Joi.object().keys({
                        id: Joi.string().required(),
                        title: Joi.string().required(),
                        data: Joi.object().required(),
                        source: Joi.string().optional(),
                        text: Joi.string().optional()
                    })),
                    graphs: Joi.array().items(Joi.object().keys({
                        id: Joi.string().required(),
                        title: Joi.string().required(),
                        data: Joi.object().required(),
                        source: Joi.string().optional(),
                        text: Joi.string().optional()
                    })) */
                }
            ).or('content', 'meta').min(1))
    },
    replaceContent: {
        options: {
            contextRequest: true,
        },
        param: {
            rid: Joi.string().alphanum().required()
        },
        body: Joi.array().items(Joi.object().keys(
                {
                    section_name: Joi.string().required(),
                    main_section_id: Joi.number().required(),
                    section_id: Joi.string().required(),
                    section_pid: Joi.string().optional().allow(null),
                    content: Joi.array(),
                    meta: Joi.object().keys({
                        type: Joi.string().valid(Object.values(DATA_CONSTANTS.MODULES_META_TYPE)).required()
                    })
                }
            ).or('content', 'meta').min(1))
    },
    getContent: {
        options: {
            contextRequest: true,
        },
        param: {
            rid: Joi.string().alphanum().required()
        },
        query: {
            sid: Joi.string().required(),
            msid: Joi.string().required()
        }
    },
    getContentForSectionParent: {
        options: {
            contextRequest: true,
        },
        param: {
            rid: Joi.string().alphanum().required()
        },
        query: {
            spid: Joi.string().optional(),
            msid: Joi.string().required()
        }
    },
    getAllReportContent: {
        options: {
            contextRequest: true,
        },
        param: {
            rid: Joi.string().alphanum().required()
        }
    },
    getContentByKey: {
        options: {
            contextRequest: true,
        },
        param: {
            rid: Joi.string().alphanum().required()
        },
        query: {
            sectKey: Joi.string().required()
        }
    }

    };
