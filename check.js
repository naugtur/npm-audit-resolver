#!/usr/bin/env node
const core = require("./index");
const npmFacade = require('./src/npmfacade');
const argv = require('./src/arguments').get();

function auditOk(issues) {
    return !(issues && issues.length);
}

function printHumanReadableReport(issues) {
    if (auditOk(issues)) {
        console.log("audit ok.");
        return;
    }
    issues.forEach(issue => {
        console.log(
            `--------------------------------------------------`
        );
        console.log(`[${issue.severity}] ${issue.title}`);
        console.log(issue.items.map(item => item.report).join("\n"));
    });

    console.log(
        `--------------------------------------------------`
    );
    console.error(" 😱   Unresolved issues found!");
    console.log(
        `--------------------------------------------------`
    );
}

function printJsonReport(issues) {
    console.log(JSON.stringify(issues));
}

npmFacade.runNpmCommand('audit', { ignoreExit: true })
    .then(input => {
        if (input.error) {
            throw new Error(`'npm audit' failed with ${input.error.code}. Check the log above for more details.`);
        }
        if (!argv.json) {
            console.log(`Total of ${input.actions.length} actions to process`);
        }
        return core.checkAudit(input)
    })
    .then(result => {
        const { issues } = result;
        if (argv.json) {
            printJsonReport(result);
        } else {
            printHumanReadableReport(issues);
        }
        if (!auditOk(issues)) {
            process.exit(1);
        }
})
    .catch(e => {
        console.error(e);
        process.exit(2);
    });
