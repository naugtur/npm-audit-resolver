const RESOLUTIONS = require('../../RESOLUTIONS')

module.exports = {
    schema: {
        "properties": {
            "version": {
                "type": "number",
                "minimum": 1
            },
            "decisions": {
                type: "object",
                "additionalProperties": {
                    "type": "object",
                    properties: {
                        what: {
                            type: "string",
                            enum: Object.keys(RESOLUTIONS).map(a=>RESOLUTIONS[a]) // I know Object.values, but node6
                        },
                        when: { type: "number" }
                    }
                }
            }
        },
        "required": [
            "version",
            "decisions"
        ]
    },
    extract(data) {
        return data.decisions
    }
}