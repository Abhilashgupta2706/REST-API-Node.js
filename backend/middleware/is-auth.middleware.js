const jwt = require('jsonwebtoken');
const { nextErrorHandler, throwErrorHandler, throwErrorHandlerAuth } = require('../utils/errorHandlers')

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        throwErrorHandler('User not authenticated', 401);
    };
    const token = authHeader.split(' ')[1];
    let decodedToken;

    try {
        decodedToken = jwt.verify(token, 'ThisIsSomeSuperSecretKeyForLogginAuthenticationInPostsApp')
    }
    catch (err) {
        err.statusCode = 500;
        throw err;
    };

    if (!decodedToken) {
        throwErrorHandler('User not authenticated', 401);
    };

    req.userId = decodedToken.userId;
    next();
};