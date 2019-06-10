module.exports = {
    version: 1,
    getAudit({ promiseCommand, argv,  shellOptions }) {
        return promiseCommand(`npm audit --json ${argv.registry ? `--registry ${argv.registry}` : ''}`, shellOptions)
        //TODO: retries on ENOAUDIT
    }
}