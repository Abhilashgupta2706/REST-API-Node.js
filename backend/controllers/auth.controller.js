const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user.model');
const { nextErrorHandler, throwErrorHandler, throwErrorHandlerAuth } = require('../utils/errorHandlers.utils');


exports.signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throwErrorHandlerAuth('Validation failed, entered data is invalid/incorrect.', 422, errors.array());
    };

    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;

    try {
        const hashedPw = await bcrypt.hash(password, 12);
        const user = new User({
            name: name,
            email: email,
            password: hashedPw
        });

        const result = await user.save();
        res
            .status(201)
            .json({
                message: ' User creation successful.',
                userId: result._id
            });
    }
    catch (err) { nextErrorHandler(err, next) };
};

exports.login = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;

    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            throwErrorHandler('User not found! Please try again.', 404);
        };

        loadedUser = user;
        const passMatched = await bcrypt.compare(password, user.password);
        if (!passMatched) {
            throwErrorHandler('Invalid Password!', 401);
        };

        const token = jwt.sign({
            email: loadedUser.email,
            userId: loadedUser._id.toString()
        }, 'ThisIsSomeSuperSecretKeyForLogginAuthenticationInPostsApp', { expiresIn: '1h' });

        console.log('User LoggedIn => ', loadedUser);

        res
            .status(200)
            .json({
                token: token,
                userId: loadedUser._id.toString()
            });
    }
    catch (err) { nextErrorHandler(err, next) };
};

exports.updateUserStatus = async (req, res, next) => {
    const newStatus = req.body.status;

    try {
        const user = await User.findById(req.userId);
        if (!user) {
            throwErrorHandler('User not found! Please try again.', 404);
        };

        user.status = newStatus;
        await user.save();
        res
            .status(200)
            .json({
                message: "User's status updated."
            });
    }
    catch (err) { nextErrorHandler(err, next) };
};

exports.getUserStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            throwErrorHandler('User not found! Please try again.', 404);
        };

        res
            .status(200)
            .json({
                status: user.status,
            });
    }
    catch (err) { nextErrorHandler(err, next) };
};