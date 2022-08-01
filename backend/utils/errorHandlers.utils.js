exports.nextErrorHandler = (error, next) => {
    if (!error.statusCode) {
        error.statusCode = 500;
    };
    next(error);
};

exports.throwErrorHandler = (errorMessage, errorStatusCode) => {
    const error = new Error(errorMessage);
    error.statusCode = errorStatusCode;
    throw (error);
};


exports.throwErrorHandlerAuth = (errorMessage, errorStatusCode, errorsArray) => {
    const error = new Error(errorMessage);
    error.statusCode = errorStatusCode;
    error.data = errorsArray;
    throw (error);
};