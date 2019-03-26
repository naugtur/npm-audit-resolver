const FILE = require('../auditFile/FILE')

module.exports = {
    printSkipping(action) {
        console.log(
            `skipping issues in ${action.module} based on decisions: ${action.resolves.map(re => re.decision).join()} from ${FILE.FILENAME}`
        )
    },
    printIssue(issue) {
        console.log(
            `--------------------------------------------------`
        );
        console.log(`[${issue.severity}] ${issue.title}`);
        console.log(issue.items.map(item => item.report).join("\n"));
    },
    
}