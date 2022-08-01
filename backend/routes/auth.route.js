const express = require('express');
const { body } = require('express-validator/check');

const authController = require('../controllers/auth.controller');
const User = require('../models/user.model');
const isAuth = require('../middleware/is-auth.middleware');

const router = express.Router();

router.put('/signup', [
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .custom((value, { req }) => {
            console.log('----------------------------------------')
            console.log(value)
            return User
                .findOne({ email: value })
                .then(userDoc => {
                    if (userDoc) {
                        return Promise.reject('E-mail already exist! Pick another.')
                    };
                });
        })
        .normalizeEmail(),

    body('password')
        .trim()
        .isLength({ min: 5 }),

    body('name')
        .trim()
        .isLength({ min: 5 }),

], authController.signup);

router.post('/login', authController.login);

router.get('/status', isAuth, authController.getUserStatus);
router.patch('/status', isAuth, [
    body('status')
        .trim()
        .not()
        .isEmpty()
], authController.updateUserStatus);

module.exports = router;