const { getUnresolved } = require('../check/auditChecker')
const { load, flush } = require('audit-resolve-core/auditFile');
const argv = require('audit-resolve-core/arguments').get();

const prompter = require('./prompter');

module.exports = {
    /**
     *
     *
     * @param {Array<Vuln>} audit
     * @returns {Promise}
     */
    askForResolutions(audit) {
        if(argv.migrate){
            load()
            flush()
        }
        return getUnresolved(audit).reduce(
                (prev, vuln) =>
                    prev.then(() =>
                        prompter.handleVuln(vuln)
                    ),
                Promise.resolve()
            )
    },
    askForFix(audit) {
        const unresolved = getUnresolved(audit)
        
        if(unresolved && unresolved.length>0 && unresolved.some(vuln => vuln.fixAvailable)) {
            return prompter.askToFix(unresolved)
        }
    }
}