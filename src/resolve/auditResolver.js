const { dropResolvedActions } = require('audit-resolve-core/statusManager');
const { load, flush } = require('audit-resolve-core/auditFile');
const argv = require('audit-resolve-core/arguments').get();

const prompter = require('./prompter');

module.exports = {
    askForResolutions(audit) {
        if(argv.migrate){
            load()
            flush()
        }
        return dropResolvedActions(audit.actions).reduce(
                (prev, action) =>
                    prev.then(() =>
                        prompter.handleAction(action, audit.advisories)
                    ),
                Promise.resolve()
            )
    }
}