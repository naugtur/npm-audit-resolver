#!/usr/bin/env node
const pkgFacade = require('./src/pkgFacade');
const view = require('./src/views/general')
const argv = require('./src/arguments').get();
const auditResolver = require('./src/resolve/auditResolver')

if (argv.yarn) {
    pkgFacade.addImplementation('yarn', require('./src/pkgmanagers/yarn'))
    pkgFacade.setActiveImplementation('yarn')
} else if (argv["yarn-berry"]) {
    pkgFacade.addImplementation('yarn-berry', require('./src/pkgmanagers/yarnBerry'))
    pkgFacade.setActiveImplementation('yarn-berry')
} else {
    pkgFacade.addImplementation('npm', require('./src/pkgmanagers/npm'))
    pkgFacade.setActiveImplementation('npm')
}

pkgFacade.getAudit({ shellOptions: { ignoreExit: true } })
    .then(async input => {
        const choice = await auditResolver.askForFix(input)
        if (choice === 'f') {
            return pkgFacade.getAudit({ shellOptions: { ignoreExit: true } })
        } else {
            return input
        }
    })
    .then(input => {
        return auditResolver.askForResolutions(input)
    })
    .catch(e => {
        view.genericError(e);
        process.exit(2);
    });
