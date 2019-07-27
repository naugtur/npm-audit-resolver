#!/usr/bin/env node
const pkgFacade = require('audit-resolve-core/pkgFacade');
const view = require('./src/views/general')
const argv = require('audit-resolve-core/arguments').get();
const auditResolver = require('./src/resolve/auditResolver')

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
        return auditResolver.askForResolutions(input)
    })
    .catch(e => {
        view.genericError(e);
        process.exit(2);
    });
