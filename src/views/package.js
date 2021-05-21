const { RESOLUTIONS } = require('audit-resolve-core');

const safePrint = message => new Promise((resolve, reject) => process.stdout.write(message, (err) => {
    if (err) { reject(err) }
    resolve()
}));

// FIXME: drop Node.js v6 support
// const safePrint = require('util').promisify(process.stdout.write.bind(process.stdout))
const severityNumber = {
    low: 10,
    moderate: 20,
    high: 30,
    critical: 40
}

function reportDecision(decision){
    //TODO: print message based on decision
    // was already fixed, postpone ran out etc
    return decision
}
const view = {
    /**
     *
     *
     * @param {VulnResolution} issue
     */
    printIssue(issue) {
        console.log(
            `--------------------------------------------------`
        );
        console.log(`[${issue.severity}] ${issue.name}: ${issue.title}`);
        console.log(issue.resolutions.map(({path, decision}) => `${path} ${reportDecision(decision)}`));
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
    printJsonReportAsync(issues) {
        return safePrint(JSON.stringify(issues, null, 2));
    }

}
module.exports = view
