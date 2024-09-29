const mongoose = require('mongoose');

const blogsSchema = mongoose.Schema(
    {
    image: { type: String, required: true,
             validate: {
               validator: (v) => v.length > 0,
               message: 'Image filename cannot be empty'
              }
    },
    category:{ type: String, required: true},
    title:{ type: String, required: true},
    description:{ type: String, required: true},
    website:{ type: String, required: true,
              validate: {
                validator: function(v) {
                return /^(https?:\/\/)?([a-z0-9]+[.])*[a-z0-9-]+(\.[a-z]{2,})(:[0-9]{1,5})?(\/.*)?$/i.test(v);
                },
                 message: 'Please provide a valid URL'
            }
    },
}, 
{
    timestamps: true
}
);

module.exports = mongoose.model('Blogs', blogsSchema);