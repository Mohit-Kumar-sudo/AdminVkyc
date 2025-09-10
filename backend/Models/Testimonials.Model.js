const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TestimonialSchema = new Schema({
    name: { type: String, index: true },
    profession:{ type:String },
    comment:{ type:String },
    rating:{ type:Number },
    image:{ type:String },
    is_active: { type: Boolean, default: true, index: true },
    status: { type: String },
    created_at: { type: Date, default: Date.now() },
    created_by: { type: mongoose.Types.ObjectId, default: 'self' },
    updated_at: { type: Date, default: Date.now() },
    updated_by: { type: String, default: 'self' },
})

const Testimonial = mongoose.model('Testimonial', TestimonialSchema)

module.exports = Testimonial