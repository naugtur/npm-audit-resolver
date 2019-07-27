const FILE = require('../auditFile/FILE')

module.exports = {
    printV1MigrationNotes(){
        console.log(`You are using a deprecated file name. ${FILE.FILENAME_DEPRECATED} was renamed to ${FILE.FILENAME}. Any changes will be written to the new file and format.`)
    },
    printSkipping(action) {
        console.log(
            `skipping issues in ${action.module} based on decisions: "${Array.from(new Set(action.resolves.map(re => re.decision))).join()}" from ${FILE.FILENAME}`
        )
    }
}