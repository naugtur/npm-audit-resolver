const RESOLUTIONS = require('../../RESOLUTIONS')

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
                        madeAt: { type: 'number' }
                    }
                }
            }
        },
        required: [
            'version',
            'decisions'
        ]
    },
    extract(data) {
        return data.decisions
    }
}