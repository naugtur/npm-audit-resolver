const RESOLUTIONS = require('../../RESOLUTIONS')
const MILIS24H = 1000 * 60 * 60 * 24

module.exports = {
    schema: {
        type: "object",
        "additionalProperties": {
            "type": "object"
        }
    },
    extract(data) {
        return Object.keys(data).reduce((acc, key) => {
            acc[key] = { madeAt: 0 }
            if (data[key].postpone) {
                acc[key].decision = RESOLUTIONS.POSTPONE
                acc[key].madeAt = data[key].postpone - MILIS24H
            }
            return acc
        }, {})
    }
}