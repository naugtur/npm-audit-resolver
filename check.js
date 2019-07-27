#!/usr/bin/env node
const pkgFacade = require('audit-resolve-core/pkgFacade');
const view = Object.assign({}, require('./src/views/package'), require('./src/views/general'))
const argv = require('audit-resolve-core/arguments').get();
const auditChecker = require('./src/check/auditChecker')

function auditOk(issues) {
    return !(issues && issues.length);
}

// MARK_YARN
// register your implementation
pkgFacade.addImplementation('npm', require('./src/pkgmanagers/npm'))
// add detection or some sort of selection here
pkgFacade.setActiveImplementation('npm')

pkgFacade.getAudit({ shellOptions: { ignoreExit: true } })
    .then(input => {
        if (!argv.json) {
            view.totalActions(input.actions.length)
        }
        return auditChecker.aggregateIssuesFromAudit(input)
    })
    .then(result => {
        const { issues } = result;
        if (argv.json) {
            view.printJsonReport(result);
        } else {
            view.printHumanReadableReport(auditOk(issues), issues);
        }
        if (!auditOk(issues)) {
            process.exit(1);
        }
    })
    .catch(e => {
        view.genericError(e);
        process.exit(2);
    });
