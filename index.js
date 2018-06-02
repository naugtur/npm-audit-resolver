#!/usr/bin/env node
const prompter = require('./src/prompter');
const statusManager = require('./src/statusManager');
const npmFacade = require('./src/npmfacade');

npmFacade.runNpmCommand('audit', { ignoreExit: true })
    .then(input => {
        console.log(`Total of ${input.actions.length} actions to process`)
        return input.actions
            .map(statusManager.addStatus)
            .filter(a => {
                if (a.humanReviewComplete) {
                    console.log(`skipping ${a.module} issue based on audit-resolv.json`)
                }
                return !a.humanReviewComplete
            })
            .reduce(
                (prev, action) =>
                    prev.then(() =>
                        prompter.handleAction(action, input.advisories)
                    ),
                Promise.resolve()
            )
    })
    .then(() => console.log('done.'))
    .catch(e => console.error(e));
