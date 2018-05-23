const fs = require("fs");

var data = {};

const biuldKey = ({ id, path }) => `${id}|${path}`;

function load() {
    try {
        const rawdata = fs.readFileSync("audit-resolv.json");
        data = JSON.parse(rawdata);
    } catch (e) {}
}

load();

module.exports = {
    load,
    flush() {
        fs.writeFileSync("audit-resolv.json", JSON.stringify(data));
    },
    set({ id, path }, value) {
        return (data[biuldKey({ id, path })] = value);
    },
    get({ id, path }) {
        return data[biuldKey({ id, path })];
    }
};
