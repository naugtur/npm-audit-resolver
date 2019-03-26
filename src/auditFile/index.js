const auditFile = require('./fileHandle')
const RESOLUTIONS = require('../RESOLUTIONS')
const MILIS24H = 1000 * 60 * 60 * 24
var data = null;

const buildKey = ({ id, path }) => `${id}|${path}`;

function load() {
    if (data) {
        return
    }
    data = {} //in case loading fails, have something valid to extend and save
    try {
        data = auditFile.load()
    } catch (e) { }
}

const longRandomRegex = /^[a-z0-9]{64}$/
// I'm still hoping this can be removed if audit results get it fixed for git packages
function pathCorruptionWorkaround(depPath) {
    const chunks = depPath.split('>')
    return chunks.map(c => {
        if (c.match(longRandomRegex)) {
            return '00unidentified'
        } else {
            return c
        }
    }).join('>')
}

function statusFromData(item) {
    if (!item) {
        return RESOLUTIONS.NONE
    }
    const decision = item.decision.toLowerCase()
    if (decision === RESOLUTIONS.POSTPONE && Date.now() > item.madeAt + MILIS24H) {
        return RESOLUTIONS.POSTPONE_EXPIRED
    }
    return RESOLUTIONS[RESOLUTIONS.reverseLookup[decision]] || RESOLUTIONS.NONE
}

module.exports = {
    load,
    flush() {
        auditFile.save(data)
    },
    set({ id, path }, value, reason) {
        if (!RESOLUTIONS.reverseLookup[value]) {
            throw Error(`invalid resolution value ${value}`)
        }
        load()
        path = pathCorruptionWorkaround(path)
        return (data[buildKey({ id, path })] = {
            decision: value,
            madeAt: Date.now(),
            reason
        });
    },
    get({ id, path }) {
        load()
        path = pathCorruptionWorkaround(path)
        return statusFromData(data[buildKey({ id, path })]);
    }
};

