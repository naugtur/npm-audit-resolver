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
                        what: { type: "string" },
                        when: { type: "number" }
                    }
                }
            }
        },
        "required": [
            "version"
        ]
    },
    extract(data) {
        return data.decisions
    }
}