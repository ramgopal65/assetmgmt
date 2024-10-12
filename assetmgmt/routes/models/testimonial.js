const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TestimonialSchema = new Schema({
    testimonialContent: {
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    }
}, { timestamps: true });


Schema.Types.String.checkRequired(v => v != null);

// Indexes
TestimonialSchema.index({ title: 1 }, { unique: false });

module.exports = mongoose.model('testimonial', TestimonialSchema);
