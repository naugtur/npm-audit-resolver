#!/usr/bin/env node
const pkgFacade = require('audit-resolve-core/pkgFacade');
const view = require('./src/views/general')
const argv = require('audit-resolve-core/arguments').get();
const auditResolver = require('./src/resolve/auditResolver')

if (argv.yarn) {
    pkgFacade.addImplementation('yarn', require('./src/pkgmanagers/yarn'))
    pkgFacade.setActiveImplementation('yarn')
} else {
    pkgFacade.addImplementation('npm', require('./src/pkgmanagers/npm'))
    pkgFacade.setActiveImplementation('npm')
}

pkgFacade.getAudit({ shellOptions: { ignoreExit: true } })
    .then(input => {
        return auditResolver.askForResolutions(input)
    })
    .catch(e => {
        view.genericError(e);
        process.exit(2);
    });
