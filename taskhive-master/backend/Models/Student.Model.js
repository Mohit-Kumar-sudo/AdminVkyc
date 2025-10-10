const mongoose = require('mongoose')
const Schema = mongoose.Schema

const StudentSchema = new Schema({
    name: { type: String },
    company:{ type:String },
    college:{ type:String },
    image:{ type:String },
    is_active: { type: Boolean, default: true, index: true },
    status: { type: String },
    created_at: { type: Date, default: Date.now() },
    created_by: { type: mongoose.Types.ObjectId, default: 'self' },
    updated_at: { type: Date, default: Date.now() },
    updated_by: { type: String, default: 'self' },
})

const Student = mongoose.model('student', StudentSchema)

module.exports = Student