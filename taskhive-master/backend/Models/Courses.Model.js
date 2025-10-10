const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CoursesSchema = new Schema({
    title: { type: String, index: true },
    skill: { type: String},
    duration: { type: Number},
    price: { type: Number},
    image:{ type:String},
    image1:{ type:String},
    heading:{ type:String },
    heading0:{ type:String },
    heading1:{ type:String },
    description:{ type:String },
    description0:{ type:String },
    description1:{ type:String },
    tdescription:{ type:String },
    pointer:{ type:String },
    pointer0:{ type:String },
    pointer1:{ type:String },
    pointer2:{ type:String },
    pointer3:{ type:String },
    pointer4:{ type:String },
    pointer5:{ type:String },
    pointer6:{ type:String },
    pointer7:{ type:String },
    pointer8:{ type:String },
    pointer9:{ type:String },
    cdate:{ type:String },
    ctime:{ type:String },
    chour:{ type:String },
    csession:{ type:String },
    has_sale: { type: Boolean, default: false },
    original_price: { type: Number },
    sale_end_date: { type: Date },
    sale_duration_minutes: { type: Number, default: 10 },
    is_active: { type: Boolean, default: true, index: true },
    status: { type: String },
    created_at: { type: Date, default: Date.now() },
    created_by: { type: mongoose.Types.ObjectId, default: 'self' },
    updated_at: { type: Date, default: Date.now() },
    updated_by: { type: String, default: 'self' },
})

const Table = mongoose.model('Courses', CoursesSchema)

module.exports = Table