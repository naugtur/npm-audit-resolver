const fs = require('fs');
const path = require('path');
const argv = require('./arguments')

var data = null;

const biuldKey = ({ id, depPath }) => `${id}|${depPath}`;
const filePath = () => path.resolve(argv.get().prefix || '.', 'audit-resolv.json')

function load() {
    if (data) {
        return
    }
    data = {} //in case loading fails, have something valid to extend and save
    try {
        const rawdata = fs.readFileSync(filePath());
        data = JSON.parse(rawdata);
    } catch (e) { }
}

const longRandomRegex = /^[a-z0-9]{64}$/
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
        fs.writeFileSync(filePath(), JSON.stringify(data, null, 2));
    },
    set({ id, depPath }, value) {
        load()
        depPath = pathCorruptionWorkaround(depPath)
        return (data[biuldKey({ id, depPath })] = value);
    },
    get({ id, depPath }) {
        load()
        depPath = pathCorruptionWorkaround(depPath)
        return data[biuldKey({ id, depPath })];
    }
};