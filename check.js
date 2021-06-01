#!/usr/bin/env node
const pkgFacade = require('audit-resolve-core/pkgFacade');
const view = Object.assign({}, require('./src/views/package'), require('./src/views/general'))
const argv = require('audit-resolve-core/arguments').get();
const auditChecker = require('./src/check/auditChecker')

function auditOk(issues) {
    return !(issues && issues.length);
}

if (argv.yarn) {
    pkgFacade.addImplementation('yarn', require('./src/pkgmanagers/yarn'))
    pkgFacade.setActiveImplementation('yarn')
} else if (argv.pnpm) {
    pkgFacade.addImplementation('pnpm', require('./src/pkgmanagers/pnpm'))
    pkgFacade.setActiveImplementation('pnpm')
} else {
    pkgFacade.addImplementation('npm', require('./src/pkgmanagers/npm'))
    pkgFacade.setActiveImplementation('npm')
}

pkgFacade.getAudit({ argv, shellOptions: { ignoreExit: true } })
    .then(input => {
        if (!argv.json) {
            view.totalActions(input.actions.length)
        }
        return auditChecker.aggregateIssuesFromAudit(input)
    })
    .then(result => {
        const { issues } = result;
        if (argv.json) {
            return view.printJsonReportAsync(result)
                .then(() => auditOk(issues));
        } else {
            view.printHumanReadableReport(auditOk(issues), issues);
            return auditOk(issues)
        }
    }).then(isOk => {
        if (!isOk) {
            process.exit(1);
        }
    })
    .catch(e => {
        view.genericError(e);
        process.exit(2);
    });
