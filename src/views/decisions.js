const chalk = require('chalk')
const RESOLUTIONS = require('audit-resolve-core/resolutions/RESOLUTIONS')
function appendWarningLine(message, line) {
    return message + '\n     ' + chalk.bold(line);
}


const colors = {
    critical: chalk.bold.white.bgRedBright,
    high: chalk.bold.redBright,
    moderate: chalk.bold.yellow
}
function getSeverityTag(advisory) {
    const color = colors[advisory.severity] || (a => a);
    return color(`[ ${advisory.severity} ]`)
}


// I admit I would appreciate being able to use typescript for function arguments here
// Used defaults as examples instead
// It should make writing more detailed views easy
module.exports = {
    printDecision(text=''){
        console.log(`Selected: ${text}`)
    },
    printChoices(choices = [{ key: "", name: "" }]) {
        console.log('_');
        console.log(
            choices
                .map(c => ` ${chalk.bold(c.key)}) ${c.name}`).join('\n')
        );
    },
    printActionIntro(action = {
        module: "",
        resolves: [],
        target: "",
        action: "",
        isMajor: false
    }) {
        console.log(`\n--------------------------------------------------`);
        console.log(` ${chalk.bold.black.bgWhite(action.module)} needs your attention.\n`);

    },
    buildEntryForResolution(re = {
        id: 0,
        path: "",
        dev: false,
        optional: false,
        bundled: false
    }) {
        let type = re.dev ? ' devDependencies' : 'dependencies';
        re.optional && (type += ' (optional)');
        re.bundled && (type += ' (bundled)');
        let reportLine = ` - ${type}: ${re.path}`;
        if (re.decision) {
            re.decision === RESOLUTIONS.FIX &&
                (reportLine = appendWarningLine(reportLine, '^ this issue was marked as fixed earlier'));
            re.decision === RESOLUTIONS.POSTPONE &&
                (reportLine = appendWarningLine(reportLine, '^ this issue was already postponed'));
        }
        if (re.isMajor) {
            reportLine = appendWarningLine(reportLine, '! warning, fix is a major version upgrade');
        }
        return reportLine
    },
    printResolutionGroupInfo(resolutionsGroup = ["string from buildEntryForResolution"], advisory = {
        "findings": [
            {
                "version": "",
                "paths": [
                    ""
                ],
                "dev": false,
                "optional": false,
                "bundled": false
            }
        ],
        "id": 0,
        "created": "",//"2015-10-17T19:41:46.382Z",
        "updated": "",
        "deleted": null,
        "title": "",
        "found_by": {
            "name": ""
        },
        "reported_by": {
            "name": ""
        },
        "module_name": "",
        "cves": [
            ""
        ],
        "vulnerable_versions": "",
        "patched_versions": "",
        "overview": "",
        "recommendation": "",
        "references": "",
        "access": "",
        "severity": "",
        "cwe": "",
        "metadata": {
            "module_type": "",
            "exploitability": 2,
            "affected_components": ""
        },
        "url": ""
    }) {
        const severityTag = getSeverityTag(advisory);
        console.log(`${severityTag} ${advisory.title}`);
        console.log(
            ` vulnerable versions ${advisory.vulnerable_versions} found in:`
        );
        console.log(resolutionsGroup.join('\n'));
    },
    printDetailsOfAdvisory({ advisory = {
        "findings": [
            {
                "version": "",
                "paths": [
                    ""
                ],
                "dev": false,
                "optional": false,
                "bundled": false
            }
        ],
        "id": 0,
        "created": "",//"2015-10-17T19:41:46.382Z",
        "updated": "",
        "deleted": null,
        "title": "",
        "found_by": {
            "name": ""
        },
        "reported_by": {
            "name": ""
        },
        "module_name": "",
        "cves": [
            ""
        ],
        "vulnerable_versions": "",
        "patched_versions": "",
        "overview": "",
        "recommendation": "",
        "references": "",
        "access": "",
        "severity": "",
        "cwe": "",
        "metadata": {
            "module_type": "",
            "exploitability": 2,
            "affected_components": ""
        },
        "url": ""
    }
    }) {
        const versions = advisory.findings.map(f => f.version).join();
        console.log(`${chalk.bold(advisory.module_name)} versions installed: ${chalk.bold(versions)}
${advisory.overview}
${advisory.recommendation}
${advisory.references}`);
    },
    printLowSeverityHint() {
        console.log(chalk.greenBright(` ✔ automatically ignore low severity issue`))
    },
    printIgnoreQuestion(){
        console.log('\n You can ignore permanently or decide to revisit later')   
    }
}