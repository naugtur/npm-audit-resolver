const { dropResolvedActions } = require('../core/statusManager');

const prompter = require('./prompter');

module.exports = {
    askForResolutions(audit) {
        return dropResolvedActions(audit.actions)
            .reduce(
                (prev, action) =>
                    prev.then(() =>
                        prompter.handleAction(action, audit.advisories)
                    ),
                Promise.resolve()
            )
    },
}