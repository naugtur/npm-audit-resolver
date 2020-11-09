const fs = require('fs')
const argv = require('audit-resolve-core/arguments').get()

module.exports = {
  getAudit () {
    console.log('>>>mock get audit')
    if (typeof argv.mock === 'string') {
      return Promise.resolve(JSON.parse(fs.readFileSync(argv.mock)))
    } else {
      return Promise.resolve(JSON.parse(fs.readFileSync('mock-audit.json')))
    }
  }
}
