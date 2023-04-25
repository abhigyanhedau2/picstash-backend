const catchAsync = require('./../utils/catchAsync.js');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/appError.js');
const User = require('./../models/User');

const signup = catchAsync(async (req, res, next) => {

    // Fetch the values from req.body
    const { name, email, password } = req.body;

    // Perform validation
    if (name === undefined || !validator.isAlpha(name)) return next(new AppError(400, 'Enter a valid name.'));
    if (email === undefined || !validator.isEmail(email)) return next(new AppError(400, 'Enter a valid email address.'));
    if (password === undefined || password.length < 6) return next(new AppError(400, 'Enter a valid password of 6 or more characters.'));

    const stringedPassword = password.toString();

    // Check if user already exists
    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) return next(new AppError(400, 'User already exists. Try logging in.'));

    // Hash the password
    const hashedPassword = await bcrypt.hash(stringedPassword, 12);

    // Create a new user
    const newUser = await User.create({ name, email, password: hashedPassword });

    // Return the new user
    return res.status(201).json({
        status: 'success',
        user: {
            id: newUser.id,
            name: newUser.name,
            email,
            posts: newUser.posts
        }
    });
});

const login = catchAsync(async (req, res, next) => {

    // Fetch the values from req.body
    const { email, password } = req.body;

    // Perform validation
    if (email === undefined || !validator.isEmail(email)) return next(new AppError(400, 'Enter a valid email address.'));
    if (password === undefined || password.length < 6) return next(new AppError(400, 'Enter a valid password of 6 or more characters.'));

    const stringedPassword = password.toString();

    // Fetch the user from the database
    const user = await User.findOne({ email }).populate('posts');

    // If user is not found, return wrong email or password
    if (!user) return next(new AppError(400, 'Wrong email or password.'));

    // Else, try to match the passwords
    const passwordIsCorrect = await bcrypt.compare(stringedPassword, user.password);

    // If password is incorrect, return wrong email or password
    if (!passwordIsCorrect) return next(new AppError(400, 'Wrong email or password.'));

    // Return the user data except password
    return res.status(200).json({
        status: 'success',
        user: {
            id: user.id,
            name: user.name,
            email,
            posts: user.posts
        }
    });
});

module.exports = { signup, login };