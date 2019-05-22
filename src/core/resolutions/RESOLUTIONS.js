const RESOLUTIONS = {
    NONE: 'none',
    FIX: 'fix',
    IGNORE: 'ignore',
    POSTPONE: 'postpone',
    EXPIRED: 'expired'
}

RESOLUTIONS.reverseLookup = Object.keys(RESOLUTIONS).reduce((acc, key) => {
    acc[RESOLUTIONS[key]] = key
    return acc;
}, {})

module.exports = RESOLUTIONS