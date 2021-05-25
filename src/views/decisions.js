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
function getSeverityTag(item) {
    const color = colors[item.severity] || (a => a);
    return color(`[ ${item.severity} ]`)
}


reportMessages = {
    [RESOLUTIONS.FIX]: chalk.yellow("! this item was marked as fixed earlier"),
    [RESOLUTIONS.EXPIRED]: chalk.magenta("! decision to ignore expired"),
}

function reportResolution(resolution) {
    return reportMessages[resolution] || ""
}

module.exports = {
    printDecision(text = '') {
        console.log(`Selected: ${text}`)
    },
    printChoices(choices = [{ key: "", name: "" }]) {
        console.log('_');
        console.log(
            choices
                .map(c => ` ${chalk.bold(c.key)}) ${c.name}`).join('\n')
        );
    },
    /**
     *
     *
     * @param {VulnResolution} vuln
     */
    printIntro(vuln) {
        const severityTag = getSeverityTag(vuln);
        console.log(`\n------------------------------------------------------`);
        console.log(`${severityTag} ${chalk.bold.black.bgWhite(vuln.name)}    ${vuln.url}`);
        console.log(`  ${vuln.title}`);

        console.log(`\nvulnerable versions ${vuln.range} found in:`);

        vuln.resolutions.forEach(({ resolution, path }) => console.log(` - ${path} ${reportResolution(resolution)}`))

        if (vuln.fixAvailable?.isSemVerMajor) {
            console.log(chalk.yellow(`\n  warning: fix is a major version upgrade`));
        }
    },
    printLowSeverityHint() {
        console.log(chalk.greenBright(` ✔ automatically ignore low severity issue`))
    },
    printIgnoreQuestion() {
        console.log('\n You can ignore permanently or decide to revisit later')
    }
}