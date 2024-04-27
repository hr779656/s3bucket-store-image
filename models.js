const mongoose = require('mongoose');

const uploadImageSchema = mongoose.Schema({
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    image: {
        type: String,
    },
    imageUrl: {
        type: String,
    }

},
 {
    timestamps: true
 }
)

const imageModel = mongoose.model('UplaodImages', uploadImageSchema)
module.exports = imageModel;


