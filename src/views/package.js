const FILE = require('../auditFile/FILE')

module.exports = {
    printSkipping(item){
        console.log(
            `skipping issues in ${item.module} based on decisions: ${item.resolves.map(re=>re.decision).join()} from ${FILE.FILENAME}`
        )
    }
}