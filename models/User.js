const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please specify the name.']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'Please enter a valid email.'],
        validate: [validator.isEmail, 'Please enter a valid email.']
    },
    password: {
        type: String,
        required: [true, 'Please enter a password of atleast 6 characters.']
    },
    posts: {
        type: [{
            type: mongoose.Schema.ObjectId,
            ref: 'Post'
        }],
        default: []
    }
});

const User = new mongoose.model('User', userSchema);

module.exports = User;