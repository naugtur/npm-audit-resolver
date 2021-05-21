#!/usr/bin/env node
const pkgFacade = require('./src/pkgFacade');
const view = Object.assign({}, require('./src/views/package'), require('./src/views/general'))
const argv = require('./src/arguments').get();
const auditChecker = require('./src/check/auditChecker')

function auditOk(issues) {
    return !(issues && issues.length);
}

if (argv.yarn) {
    pkgFacade.addImplementation('yarn', require('./src/pkgmanagers/yarn'))
    pkgFacade.setActiveImplementation('yarn')
} else {
    pkgFacade.addImplementation('npm', require('./src/pkgmanagers/npm'))
    pkgFacade.setActiveImplementation('npm')
}

pkgFacade.getAudit({ argv, shellOptions: { ignoreExit: true } })
    .then(input => {
        console.log(input)
        if (!argv.json) {
            view.totalActions(Object.keys(input).length)
        }
        return auditChecker.getUnresolved(input)
    })
    .then(issues => {
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
