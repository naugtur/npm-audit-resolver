const fs = require('fs')

module.exports = {
    getAudit() {
        return Promise.resolve(fs.readFileSync(`mock-audit.json`))
    }
}