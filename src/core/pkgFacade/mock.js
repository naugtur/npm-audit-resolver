const fs = require('fs')

module.exports = {
    getAudit() {
        console.log('>>>mock get audit')
        return Promise.resolve(fs.readFileSync(`mock-audit.json`))
    }
}