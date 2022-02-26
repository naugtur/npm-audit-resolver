const { RESOLUTIONS } = require('audit-resolve-core');

const safePrint = require('util').promisify(process.stdout.write.bind(process.stdout))
const severityNumber = {
    low: 10,
    moderate: 20,
    high: 30,
    critical: 40
}

reportMessages = {
    [RESOLUTIONS.EXPIRED]: "! decision to ignore expired"
}

function reportResolution(resolution) {
    return reportMessages[resolution] || ""
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
        console.log(`[${issue.severity}] ${issue.name}: ${issue.title} (${issue.id})`);
        console.log(issue.resolutions.map(({ path, resolution }) => `  ${path} ${reportResolution(resolution)}`).join("\n"));
    },
    printOhnoes() {
        console.log(
            `--------------------------------------------------`
        );
        console.log(" 😱   Unresolved issues found!");
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
