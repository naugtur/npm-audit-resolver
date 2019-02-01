#!/usr/bin/env node
const core = require('./index')
const npmFacade = require('./src/npmfacade');
const yarnManager = require('./src/yarn-manager')

yarnManager.addPackageLockFromYarnIfNecessary()
    .then(() => {
        return npmFacade.runNpmCommand('audit', { ignoreExit: true })
    })
    .then(yarnManager.removePackageLockIfNecessary)
    .then(input => {
        console.log(`Total of ${input.actions.length} actions to process`)
        return core.resolveAudit(input)
    })
    .then(() => console.log('done.'))
    .catch(e => {
        console.error(e)
        yarnManager.removePackageLockIfNecessary()
    })
