const createError = require('http-errors')
const Model = require('../Models/activityLog.model')
const mongoose = require('mongoose')
const ModelName = 'activityLog'
const moment = require("moment")

module.exports = {

    create: async (req, res, next) => {
        try {
            const data = req.body
            data.instrument = data.instrument[0];
            data.partyRole = data.partyRole[0];
            data.created_by = req.user ? req.user : 'unauth'
            data.updated_by = req.user ? req.user : 'unauth'
            data.created_at = Date.now()
            const newData = new Model(data)
            const result = await newData.save()
            if (result) {
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
                res.send({ success: true, msg: 'Data Updated Successfully' })
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
    }

}
