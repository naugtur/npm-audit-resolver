import auditFile from 'audit-resolve-core/auditFile/index.js';
import _args from 'audit-resolve-core/arguments.js';
import getUnresolved from '../check/auditChecker.js';
import prompter from './prompter.js';

const argv = _args.get();
const { load, flush } = auditFile;

export default {
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