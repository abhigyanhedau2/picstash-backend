const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    caption: {
        type: String
    },
    imageKey: {
        type: String,
        required: [true, 'Please upload an image.']
    }
});

const Post = new mongoose.model('Post', postSchema);

module.exports = Post;