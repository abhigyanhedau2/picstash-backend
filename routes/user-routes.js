const express = require('express');

const router = express.Router();

const { signup, login } = require('./../controllers/user-controllers');
const AppError = require('../utils/appError');

router.route('/signup').post(signup);
router.route('/login').post(login);

router.use((req, res, next) => {
    return next(new AppError(404, 'Route not found.'));
});

module.exports = router;