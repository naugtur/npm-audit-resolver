// MARK_YARN
// This area left for your fabulous contribution
module.exports = {
    version: 1,
    getAudit({ promiseCommand, argv, shellOptions }) {

        // just return a promise with an audit
        return promiseCommand(``, shellOptions)
    },
    fix({ promiseCommand, argv, shellOptions, action, command }) {
        // implement fixing the particular set of problems by picking what you need from action and command
        // Could also throw an error claiming fixing is not implemented and they shoud run overall fix before running this tool
        // I'd accept that as a user if it was too difficult to implement fixing individual problems
    },
    remove({ promiseCommand, argv, shellOptions, names }) {
        return promiseCommand(`${names.join(' ')}`, shellOptions)
    }
}