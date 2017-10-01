const validate = require('jsonschema').validate;

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
                enabled: { type: 'boolean', required: true },
                port: { type: 'integer', required: true },
            },
            required: true,
        },
        keys: {
            type: 'object',
            properties: {
                token: { type: 'string', required: true },
                dbots: { type: 'string', required: true },
                botspw: { type: 'string', required: true },
            },
            required: true,
        },
        disabledEvents: {
            type: 'array',
            items: { type: 'string', required: true },
            required: true,
        },
    },
};

function isValid (config) {
    try {
        validate(config, configSchema, { throwError: true });
        return true;
    } catch (e) {
        return false;
    }
}

module.exports = isValid;