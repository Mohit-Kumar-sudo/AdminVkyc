const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TableSchema = new Schema({
    questionEn:{
        type:String,
        required:true
    },
    questionHi:{
        type:String,
        required:true
    },
    instrument:{
        type:Object,
        required:true
    },
    partyRole:{
        type:Object,
        required:true
    },
    videoKYCTypeEn:{
        type:String,
        required:true
    },
    videoKYCTypeHi:{
        type:String,
        required:true
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

const Table = mongoose.model("questions", TableSchema)

module.exports = Table
