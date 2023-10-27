const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TableSchema = new Schema({
    content:{
        type:String
    },
    keyName:{
        type:String
    },
    percentage:{
        type:Number
    },
    is_active: {
        type: Boolean,
        default: true
    },
    created_at: String,
    updated_at: String,
    created_by: String,
    updated_by: String,
})

const Table = mongoose.model("matrix", TableSchema)

module.exports = Table
