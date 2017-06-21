let baseEnvironment;
/**
 * Create a configuration object suitable for passing to the client by taking
 * an allow-listed set of keys from process.env.
 * In development, also read from a file named .env, if present.
 * @returns {Object}
 */
function baseConfiguration () {
    baseEnvironment = baseEnvironment || Object.assign({}, process.env);

    let source = baseEnvironment;
    if (process.env.NODE_ENV !== 'production') {
        const fromFile = require('dotenv').config();
        // If there is no .env file, don't throw and just use process.env
        if (fromFile.error && fromFile.error.code !== 'ENOENT') {
            throw fromFile.error;
        }
        // process.env will have been
        source = Object.assign(fromFile.parsed || {}, baseEnvironment);
    }

    return source;
}

/**
 * Filters baseConfiguration
 * @returns {Object}
 */
function filterConfiguration(filterArray) {
    const source = baseConfiguration();
    const allowedFields = filterArray;

    return allowedFields.reduce((result, field) => {
        result[field] = source[field];
        return result;
    }, {});
}

exports.baseConfiguration = baseConfiguration;
exports.filterConfiguration = filterConfiguration;
