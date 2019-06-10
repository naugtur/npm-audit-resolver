const RESOLUTIONS = require('../../resolutions/RESOLUTIONS')

module.exports = {
    schema: {
        properties: {
            version: {
                'type': 'number',
                'minimum': 1
            },
            decisions: {
                type: 'object',
                additionalProperties: {
                    type: 'object',
                    required: ['decision'],
                    properties: {
                        decision: {
                            type: 'string',
                            enum: Object.keys(RESOLUTIONS.reverseLookup)
                        },
                        reason: { type: 'string' },
                        madeAt: { type: 'number' },
                        expiresAt: { type: 'number' }
                    }
                }
            },
            rules: {
                type: 'object',
                properties:{
                    ignoreExpiresInDays: { type: 'number' }, //should it be days or should I pull in a dependency to resolve nice text?
                    ignoreLowSeverity: {type: 'boolean' }
                }
            }
        },
        required: [
            'version',
            'decisions'
        ]
    },
    extract(data) {
        return {
            decisions: data.decisions,
            rules: data.rules
        }
    }
}