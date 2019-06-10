const FILE = require('../core/auditFile/FILE')
const severityNumber = {
    low: 10,
    moderate: 20,
    high: 30,
    critical: 40
}
const view = {
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
    printOhnoes() {
        console.log(
            `--------------------------------------------------`
        );
        console.error(" 😱   Unresolved issues found!");
        console.log(
            `--------------------------------------------------`
        );
    },
    printHumanReadableReport(auditOk, issues) {
        if (auditOk) {
            console.log("audit ok.");
            return;
        }
        issues.sort((a, b) => {
            a = severityNumber[a.severity]
            b = severityNumber[b.severity]
            const value = (b - a)
            return value / Math.abs(value)
        }).forEach(issue => {
            view.printIssue(issue)
        })

        view.printOhnoes()
    },
    printJsonReport(issues) {
        console.log(JSON.stringify(issues, null, 2));
    }

}
module.exports = view
