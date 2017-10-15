const { validate } = require('jsonschema');

const configSchema = {
    id: 'Config',
    type: 'object',
    properties: {
        defaultPrefix: { type: 'string', required: true },
        embedColor: { type: 'integer', required: true },
        ownerID: { type: 'string', required: true },
        tick: { type: 'integer', required: true },
        webserver: {
            type: 'object',
            properties: {
                enabled: { type: 'boolean', required: false },
                port: { type: 'integer', required: false },
            },
            required: false,
        },
        keys: {
            type: 'object',
            properties: {
                token: { type: 'string', required: false },
                dbl: { type: 'string', required: false },
                botspw: { type: 'string', required: false },
            },
            required: true,
        },
        clientOptions: {
            type: 'object',
            required: false,
        },
    },
};

function isValid (config, callback) {
    try {
        validate(config, configSchema, { throwError: true });
        callback();
    } catch (err) {
        callback(err.stack);
    }
}

module.exports = isValid;