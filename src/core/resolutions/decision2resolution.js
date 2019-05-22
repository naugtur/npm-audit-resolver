const RESOLUTIONS = require('./RESOLUTIONS')
const MILIS24H = 1000 * 60 * 60 * 24

module.exports = function decision2resolution(item) {
    if (!item) {
        return RESOLUTIONS.NONE
    }
    if (item.expiresAt < Date.now()) {
        return RESOLUTIONS.EXPIRED
    }
    if (item.decision === RESOLUTIONS.POSTPONE && Date.now() > item.madeAt + MILIS24H) {
        return RESOLUTIONS.EXPIRED
    }
    return RESOLUTIONS[RESOLUTIONS.reverseLookup[item.decision]] || RESOLUTIONS.NONE
}