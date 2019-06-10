
function getCommand(action) {
    // Derived from npm-audit-report
    // TODO: share the code
    if (action.action === 'install') {
        const isDev = action.resolves[0].dev
        return `npm install ${isDev ? '--save-dev ' : ''}${action.module}@${action.target}`
    } else {
        return `npm update ${action.module} --depth ${action.depth}`
    }
}

module.exports = {
    version: 1,
    getAudit({ promiseCommand, argv,  shellOptions }) {
        return promiseCommand(`npm audit --json ${argv.registry ? `--registry ${argv.registry}` : ''}`, shellOptions)
        //TODO: retries on ENOAUDIT
    },
    fix({ promiseCommand, argv,  shellOptions, action }){
        
        return promiseCommand(getCommand(action), shellOptions)
    },
    remove({ promiseCommand, argv,  shellOptions, names }){
        //TODO: include the fact that some of them are dev dependencies and we don't know which, because we shouldn't have to at this point
        //FIXME: this command might not delete everything as expected
        return promiseCommand(`npm rm ${names.join(' ')}`, shellOptions)
    }
}