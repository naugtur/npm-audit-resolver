const auditFile = require('./fileHandle')
const RESOLUTIONS = require('../resolutions/RESOLUTIONS')
const decision2resolution = require('../resolutions/decision2resolution')
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

module.exports = {
    load,
    flush() {
        auditFile.save(data)
    },
    set({ id, path }, value, reason, expiresAt) {
        if (!RESOLUTIONS.reverseLookup[value]) {
            throw Error(`invalid resolution value ${value}`)
        }
        load()
        path = pathCorruptionWorkaround(path)
        return (data[buildKey({ id, path })] = {
            decision: value,
            madeAt: Date.now(),
            reason,
            expiresAt
        });
    },
    get({ id, path }) {
        load()
        path = pathCorruptionWorkaround(path)
        return decision2resolution(data[buildKey({ id, path })]);
    }
};

