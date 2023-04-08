#!/usr/bin/env node
import pkgFacade from './src/pkgFacade/index.js';
import viewsPackage from './src/views/package.js';
import viewsGeneral from './src/views/general.js';
import args from 'audit-resolve-core/arguments.js';
import getUnresolved from "./src/check/auditChecker.js";

const view = {
    ...viewsPackage,
    ...viewsGeneral,
};

const argv = args.get();

function auditOk(issues) {
    return !(issues && issues.length);
}

pkgFacade.init = async () => {
    if (argv.yarn) {
        const { default: yarn } = await import('./src/pkgmanagers/yarn.js');

        pkgFacade.addImplementation('yarn', yarn)
        pkgFacade.setActiveImplementation('yarn')
    } else if (argv["yarn-berry"]) {
        const { default: yarnBerry } = await import('./src/pkgmanagers/yarnBerry.js');

        pkgFacade.addImplementation('yarn-berry', yarnBerry)
        pkgFacade.setActiveImplementation('yarn-berry')
    } else {
        const { default: npm } = await import('./src/pkgmanagers/npm.js');

        pkgFacade.addImplementation('npm', npm)
        pkgFacade.setActiveImplementation('npm')
    }
};

let auditExit;
pkgFacade.getAudit({ argv, shellOptions: { ignoreExit: true, handleExit: (ex) => { auditExit = ex }} })
    .then(input => {
        if (!argv.json) {
            view.totalActions(Object.keys(input).length)
        }
        return getUnresolved(input)
    })
    .then(issues => {
        if (argv.json) {
            return view.printJsonReportAsync(issues)
                .then(() => auditOk(issues));
        } else {
            view.printHumanReadableReport(auditOk(issues), issues);
            return auditOk(issues)
        }
    }).then(isOk => {
        if (auditExit === 0) {
            process.exit(0);
        }
        if (!isOk) {
            process.exit(1);
        }
    })
    .catch(e => {
        view.genericError(e);
        process.exit(2);
    });
