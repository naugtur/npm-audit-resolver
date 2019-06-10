module.exports = {
    version: 1,
    getAudit({ promiseCommand, argv,  shellOptions }) {
        return promiseCommand(`npm audit --json ${argv.registry ? `--registry ${argv.registry}` : ''}`, shellOptions)
        //TODO: retries on ENOAUDIT
    },
    fix({ promiseCommand, argv,  shellOptions, action, command }){
        return promiseCommand(command, shellOptions)
    },
    remove({ promiseCommand, argv,  shellOptions, names }){
        //TODO: include the fact that some of them are dev dependencies and we don't know which, because we shouldn't have to at this point
        //FIXME: this command might not delete everything as expected
        return promiseCommand(`npm rm ${names.join(' ')}`, shellOptions)
    }
}