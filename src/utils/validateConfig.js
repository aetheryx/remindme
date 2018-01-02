const { validate } = require('jsonschema');

const configSchema = {
  id: 'Config',
  type: 'object',
  properties: {
    defaultPrefix: { type: 'string', required: true },
    embedColor: { type: 'integer', required: true },
    ownerID: { type: 'string', required: true },
    dbURL: { type: 'string', required: false },
    token: { type: 'string', required: true },
    tick: { type: 'integer', required: false },
    webserver: {
      type: 'object',
      properties: {
        enabled: { type: 'boolean', required: false },
        port: { type: 'integer', required: false },
      },
      required: false,
    },
    botlists: {
      type: 'array',
      required: false
    }
  }
};

async function isValid (config) {
  validate(config, configSchema, { throwError: true });
}

module.exports = isValid;