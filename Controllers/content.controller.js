const createError = require('http-errors')
const Model = require('../Models/content.model')
const mongoose = require('mongoose')
const ModelName = 'Content'
const axios = require('axios');

module.exports = {

    create: async (req, res, next) => {
        try {
            const data = req.body
            data.created_by = req.user ? req.user : 'unauth'
            data.updated_by = req.user ? req.user : 'unauth'
            data.created_at = Date.now()
            data.content_english = data.content_english.split(".")
            data.content_hindi = data.content_hindi.split("।")
            const dataExists = await Model.findOne({ contentTypeEn: data.contentTypeEn, vkycTypeEn: data.vkycTypeEn, is_active: true }).lean()
            console.log("dataExists", dataExists)
            if (dataExists) {
                const existingData = await Model.updateOne({ _id: mongoose.Types.ObjectId(dataExists._id) }, { $set: { is_active: false } })
                if (existingData) {
                    console.log(`Existing ${dataExists.contentType} has be Disabled`)
                }
            }
            const newData = new Model(data)
            const result = await newData.save()

            if (data) {
                const resData = await Model.find({ is_active: true }, { contentTypeEn: 1, contentTypeHi: 1, vkycTypeEn: 1, vkycTypeHi: 1, content_english: 1, content_hindi: 1 })
                let newData = {}
                let do_and_donts = {}
                let terms_conditions = {}
                let prerequisites = {}
                for (const item of resData) {
                    if (item.vkycTypeEn == "Assisted") {
                        if (item.contentTypeEn === "Do's and Don'ts") {
                            do_and_donts = {
                                English: item.content_english,
                                Hindi: item.content_hindi
                            };
                        }
                        if (item.contentTypeEn === "Terms and Condition") {
                            terms_conditions = {
                                English: item.content_english,
                                Hindi: item.content_hindi
                            };
                        }
                        if (item.contentTypeEn === "Prerequisites") {
                            prerequisites = {
                                English: item.content_english,
                                Hindi: item.content_hindi
                            };
                        }
                    }
                    newData = {
                        "Assisted": { do_and_donts, terms_conditions, prerequisites }
                    }
                    if (item.vkycTypeEn == "Non_Assisted") {
                        if (item.contentTypeEn === "Do's and Don'ts") {
                            do_and_donts = {
                                English: item.content_english,
                                Hindi:  item.content_hindi
                            };
                        }
                        if (item.contentTypeEn === "Terms and Condition") {
                            terms_conditions = {
                                English: item.content_english,
                                Hindi:  item.content_hindi
                            };
                        }
                        if (item.contentTypeEn === "Prerequisites") {
                            prerequisites = {
                                English: item.content_english,
                                Hindi:  item.content_hindi
                            };
                        }
                    }
                    newData = {
                        ...newData,
                        "Non_Assisted": { do_and_donts, terms_conditions, prerequisites }
                    }
                }
                try {
                    const config = {
                        headers: {
                            "x-parse-application-id": "MPSEDC_UAT",
                            "x-parse-rest-api-key": "5eefa031319958005f14c3cba94",
                            "content-type": "application/json"
                        }
                    };
                    axios.post('http://20.219.158.85:6066/api/vkyc/controlpanel/content', newData, config)
                        .then(function (response) {
                            if (response.data.status == 'succces') {
                                res.send({ success: true, msg: 'Data submitted successfully' })
                            } else {
                                res.send({ success: false, msg: 'Failed to Submit Data' })
                            }
                        }, error => {
                            console.log(error)
                        })
                } catch (error) {
                    next(error)
                }
                res.send({ success: true, msg: 'Data inserted successfully.' })
            } else {
                res.send({ success: false, msg: 'Failed to insert data.' })
            }
        } catch (error) {
            if (error.isJoi === true) error.status = 422
            next(error)
        }
    },
    get: async (req, res, next) => {
        try {
            const { id } = req.params
            if (!id) {
                throw createError.BadRequest('Invalid Parameters')
            }
            const result = await Model.findById({ _id: mongoose.Types.ObjectId(id) })
            if (!result) {
                throw createError.NotFound(`No ${ModelName} Found`)
            }
            if (result) {
                res.send({ success: true, msg: 'Detail Fetched', data: result })
            } else {
                res.send({ success: false, msg: 'Failed to Fetch Detail' })
            }

        } catch (error) {
            if (error.isJoi === true)
                return next(createError.BadRequest('Bad Request'))
            next(error)
        }
    },
    list: async (req, res, next) => {
        try {
            const { name, is_active, page, limit, sort, contentTypeEn } = req.query
            const _page = page ? parseInt(page) : 1
            const _limit = limit ? parseInt(limit) : 20
            const _skip = (_page - 1) * _limit
            const _sort = sort ? sort : '+name'
            const query = {};
            if (name) {
                query.name = new RegExp(name, 'i')
            }
            if (contentTypeEn) {
                query.contentTypeEn = contentTypeEn
            }
            const result = await Model.aggregate([
                {
                    $match: query
                },
                {
                    $skip: _skip
                },
                {
                    $sort: { is_active: -1 }
                },
                {
                    $limit: _limit
                }
            ])
            if (result) {
                res.send({ success: true, msg: 'Data Fetched', data: result, count: result.length })
            } else {
                res.send({ success: false, msg: 'Failed to Fetch Data' })
            }
        } catch (error) {
            if (error.isJoi === true)
                return next(createError.BadRequest('Bad Request'))
            next(error)
        }
    },
    update: async (req, res, next) => {
        try {
            const { id } = req.params
            const data = req.body

            if (!id) {
                throw createError.BadRequest('Invalid Parameters')
            }
            if (!data) {
                throw createError.BadRequest('Invalid Parameters')
            }
            data.updated_at = Date.now()
            const result = await Model.updateOne({ _id: mongoose.Types.ObjectId(id) }, { $set: data })
            if (result) {
                   const resData = await Model.find({ is_active: true }, { contentTypeEn: 1, contentTypeHi: 1, vkycTypeEn: 1, vkycTypeHi: 1, content_english: 1, content_hindi: 1 })
                let newData = {}
                let do_and_donts = {}
                let terms_conditions = {}
                let prerequisites = {}
                for (const item of resData) {
                    if (item.vkycTypeEn == "Assisted") {
                        if (item.contentTypeEn === "Do's and Don'ts") {
                            do_and_donts = {
                                English: item.content_english,
                                Hindi: item.content_hindi
                            };
                        }
                        if (item.contentTypeEn === "Terms and Condition") {
                            terms_conditions = {
                                English: item.content_english,
                                Hindi: item.content_hindi
                            };
                        }
                        if (item.contentTypeEn === "Prerequisites") {
                            prerequisites = {
                                English: item.content_english,
                                Hindi: item.content_hindi
                            };
                        }
                    }
                    newData = {
                        "Assisted": { do_and_donts, terms_conditions, prerequisites }
                    }
                    if (item.vkycTypeEn == "Non_Assisted") {
                        if (item.contentTypeEn === "Do's and Don'ts") {
                            do_and_donts = {
                                English: item.content_english,
                                Hindi:  item.content_hindi
                            };
                        }
                        if (item.contentTypeEn === "Terms and Condition") {
                            terms_conditions = {
                                English: item.content_english,
                                Hindi:  item.content_hindi
                            };
                        }
                        if (item.contentTypeEn === "Prerequisites") {
                            prerequisites = {
                                English: item.content_english,
                                Hindi:  item.content_hindi
                            };
                        }
                    }
                    newData = {
                        ...newData,
                        "Non_Assisted": { do_and_donts, terms_conditions, prerequisites }
                    }
                }
                try {
                    const config = {
                        headers: {
                            "x-parse-application-id": "MPSEDC_UAT",
                            "x-parse-rest-api-key": "5eefa031319958005f14c3cba94",
                            "content-type": "application/json"
                        }
                    };
                    axios.post('http://20.219.158.85:6066/api/vkyc/controlpanel/content', newData, config)
                        .then(function (response) {
                            console.log('response', response.data)
                            if (response.data.status == 'succces') {
                                res.send({ success: true, msg: 'Data submitted successfully' })
                            } else {
                                res.send({ success: false, msg: 'Failed to Submit Data' })
                            }
                        }, error => {
                            console.log(error)
                        })
                } catch (error) {
                    next(error)
                }
                res.send({ success: true, msg: 'Data inserted successfully.' })
            } else {
                res.send({ success: false, msg: 'Failed to Update Data' })
            }
        } catch (error) {
            if (error.isJoi === true)
                return next(createError.BadRequest('Bad Request'))
            next(error)
        }
    },
    delete: async (req, res, next) => {
        try {
            const { id } = req.params
            if (!id) {
                throw createError.BadRequest('Invalid Parameters')
            }
            const deleted_at = Date.now()
            const result = await Model.updateOne({ _id: mongoose.Types.ObjectId(id) }, { $set: { is_active: false, deleted_at } })
            if (result) {
                res.send({ success: true, msg: 'Data Deleted Successfully' })
            } else {
                res.send({ success: false, msg: 'Failed to Delete Data' })
            }
        } catch (error) {
            if (error.isJoi === true)
                return next(createError.BadRequest('Bad Request'))
            next(error)
        }
    },
    restore: async (req, res, next) => {
        try {
            const { id } = req.params
            if (!id) {
                throw createError.BadRequest('Invalid Parameters')
            }
            console.log(id)
            const restored_at = Date.now()
            const result = await Model.updateOne({ _id: mongoose.Types.ObjectId(id) }, { $set: { is_active: true, restored_at } })
            if (result) {
                res.send({ success: true, msg: 'Data Restored Successfully' })
            } else {
                res.send({ success: false, msg: 'Failed to Restore Data' })
            }
        } catch (error) {
            if (error.isJoi === true)
                return next(createError.BadRequest('Bad Request'))
            next(error)
        }
    },

}


function indexStrings(strList) {
    let strArray = [];
    for (let i = 0; i < strList.length; i++) {
        strArray[i] = (i + 1) + '. ' + strList[i];
    }
    return strArray;
}

