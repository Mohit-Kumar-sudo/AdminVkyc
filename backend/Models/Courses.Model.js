const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CoursesSchema = new Schema({
    title: { type: String, index: true },
    skill: { type: String, index: true },
    duration: { type: Number, index: true },
    image:{ type:String, required: true },
    heading:{ type:String },
    heading0:{ type:String },
    heading1:{ type:String },
    description:{ type:String },
    description0:{ type:String },
    description1:{ type:String },
    is_active: { type: Boolean, default: true, index: true },
    status: { type: String },
    created_at: { type: Date, default: Date.now() },
    created_by: { type: mongoose.Types.ObjectId, default: 'self' },
    updated_at: { type: Date, default: Date.now() },
    updated_by: { type: String, default: 'self' },
})

const Table = mongoose.model('Courses', CoursesSchema)

module.exports = Table