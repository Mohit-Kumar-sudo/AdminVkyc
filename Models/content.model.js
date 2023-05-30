 const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TableSchema = new Schema({
    contentTypeEn:{
        type:String
    },
    contentTypeHi:{
        type:String
    },
    vkycTypeEn:{
        type:String
    },
    vkycTypeHi:{
        type:String
    },
    content_english:{
        type:Array
    },
    content_hindi:{
        type:Array
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

const Table = mongoose.model("content", TableSchema)

module.exports = Table
