const createError = require('http-errors')
const Model = require('../Models/timeInterval.model')
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
            const dataExists = await Model.findOne({ content: data.content, is_active: true }).lean()
            if (dataExists) {
                return res.send({ success: false, msg: "Time Already Alloted" })
            }
            const newData = new Model(data)
            const result = await newData.save()

            if (result) {
                const resData = await Model.find({ is_active: true }, { keyName: 1, minutes: 1, seconds: 1 })
                let newData = []
                for (const object of resData) {
                    const transformed = object.keyName + ":" + '"' + object.minutes + ":" + object.seconds+'"'
                    newData.push(transformed)
                }
                let result = newData.reduce((acc, ele) => {
                    let [key, value] = ele.split(':');
                    let [a, b] = value.replace(/^"|"$/g, '').split(':');
                    acc[key] = a+':0'; 
                    return acc
                }, {});
         
                try {
                    const config = {
                        headers: {
                            "x-parse-application-id": "MPSEDC_UAT",
                            "x-parse-rest-api-key": "5eefa031319958005f14c3cba94",
                            "content-type": "application/json"
                        }
                    };
                    axios.post('http://20.219.158.85:6066/api/vkyc/controlpanel/timing', result , config)
                        .then((response) => {
                            if (response.data.status == 'succces') {
                                res.send({ success: true, msg: 'Data submitted successfully' })
                            } else {
                                res.send({ success: false, msg: 'Failed to Submit Data in Video KYC' })
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
            const { name, is_active, page, limit, sort } = req.query
            const _page = page ? parseInt(page) : 1
            const _limit = limit ? parseInt(limit) : 20
            const _skip = (_page - 1) * _limit
            const _sort = sort ? sort : '+name'
            const query = {};
            if (name) {
                query.name = new RegExp(name, 'i')
            }
            console.log(req.query)
            const result = await Model.aggregate([
                {
                    $match: query
                },
                {
                    $skip: _skip
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
                const resData = await Model.find({ is_active: true }, { keyName: 1, minutes: 1, seconds: 1 })
                let newData = []
                for (const object of resData) {
                    const transformed = object.keyName + ":" + '"' + object.minutes + ":" + object.seconds+'"'
                    newData.push(transformed)
                }
                let newResult = newData.reduce((acc, ele) => {
                    let [key, value] = ele.split(':');
                    let [a, b] = value.replace(/^"|"$/g, '').split(':');
                    acc[key] = a+':0'; 
                    return acc
                }, {});
         
                try {
                    const config = {
                        headers: {
                            "x-parse-application-id": "MPSEDC_UAT",
                            "x-parse-rest-api-key": "5eefa031319958005f14c3cba94",
                            "content-type": "application/json"
                        }
                    };
                    axios.post('http://20.219.158.85:6066/api/vkyc/controlpanel/timing', newResult , config)
                        .then((response) => {
                            if (response.data.status == 'succces') {
                                res.send({ success: true, msg: 'Data submitted successfully' })
                            } else {
                                res.send({ success: false, msg: 'Failed to Submit Data in Video KYC' })
                            }
                        }, error => {
                            console.log(error)
                        })
                } catch (error) {
                    next(error)
                }
                res.send({ success: true, msg: 'Data Update successfully.' })
            } else {
                res.send({ success: false, msg: 'Failed to Update data.' })
            }
        } catch (error) {
            if (error.isJoi === true) error.status = 422
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
