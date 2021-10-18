'use strict';

const AssertError = require('./error');


const internals = {};


module.exports = function (condition, ...args) {

    if (condition) {
        return;
    }

    const [maybeError] = args;
    if (maybeError instanceof Error) {
        throw maybeError;
    }

    throw new AssertError(args);
};
