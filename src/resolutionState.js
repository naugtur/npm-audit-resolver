const fs = require('fs');
const path = require('path');
const argv = require('./arguments')

var data = null;

const biuldKey = ({ id, path }) => `${id}|${path}`;
const filePath = () => path.resolve(argv.get().prefix || '.', 'audit-resolve.json')

function migrate() {
    const oldPath = path.resolve(argv.get().prefix || '.', 'audit-resolv.json');
    if (fs.existsSync(oldPath) && !fs.existsSync(filePath())) {
        const rawdata = fs.readFileSync(oldPath);
        const content = JSON.parse(rawdata);
        Object.keys(content).forEach(key => {
            if (content[key].fix) {
                content[key] = { resolution: "fix" }
            }
            if (content[key].ignore) {
                content[key] = { resolution: "ignore" }
            }
            if (content[key].remind) {
                content[key] = { resolution: "remind", remindTime: content[key].remind }
            }
        })
        content.version = 1;
        fs.writeFileSync(filePath(), JSON.stringify(content, null, 2));
        fs.writeFileSync(oldPath, '');
    }
}

function load() {
    if (data) {
        return
    }
    data = {
        version: 1
    } //in case loading fails, have something valid to extend and save
    migrate()
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
    set({ id, path }, value) {
        load()
        path = pathCorruptionWorkaround(path)
        return (data[biuldKey({ id, path })] = value);
    },
    get({ id, path }) {
        load()
        path = pathCorruptionWorkaround(path)
        return data[biuldKey({ id, path })];
    }
};