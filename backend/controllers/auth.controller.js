const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user.model');
const { nextErrorHandler, throwErrorHandler, throwErrorHandlerAuth } = require('../utils/errorHandlers.utils');


exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throwErrorHandlerAuth('Validation failed, entered data is invalid/incorrect.', 422, errors.array());
    };

    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;

    bcrypt
        .hash(password, 12)
        .then(hashedPw => {
            const user = new User({
                name: name,
                email: email,
                password: hashedPw
            });

            return user.save();
        })
        .then(result => {
            res
                .status(201)
                .json({
                    message: ' User creation successful.',
                    userId: result._id
                });
        })
        .catch(err => { nextErrorHandler(err, next) })
};

exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;

    User
        .findOne({ email: email })
        .then(user => {
            if (!user) {
                throwErrorHandler('User not found! Please try again.', 404);
            };

            loadedUser = user;
            return bcrypt.compare(password, user.password);
        })
        .then(passMatched => {
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

        })
        .catch(err => { nextErrorHandler(err, next) });
};