import promptly from './micro-promptly.js';
import actions from './actions.js';
import _args from 'audit-resolve-core/arguments.js';
import view from '../views/decisions.js';
import auditFile from 'audit-resolve-core/auditFile/index.js';

const rules = auditFile.getRules()
const argv = _args.get();

/**
 *
 *
 * @param {{vuln:VulnResolution}} { vuln }
 * @param {*} [choices=null]
 * @returns {Promise}
 */
async function optionsPrompt({ vuln }, choices = null) {

    const mandatoryChoices = [
        {
            key: 's',
            name: 'Skip this'
        },
        {
            key: 'q',
            name: 'Quit'
        }
    ];

    const defaultChoices = [
        {
            key: 'r',
            name: 'remind me in 24h'
        },
        {
            key: 'i',
            name: 'ignore paths'
        },
        {
            key: 'del',
            name: 'Remove all listed dependency paths'
        }
    ]


    // if (vuln.fixAvailable) {
    //     defaultChoices.unshift({
    //         key: 'f',
    //         name: 'fix automatically'
    //     });
    // }
    //  else {
    //     defaultChoices.unshift({
    //         key: '?',
    //         name: 'investigate'
    //     });
    // }

    choices = choices || defaultChoices
    choices = choices.concat(mandatoryChoices)

    view.printChoices(
        choices
    );

    const answer = await promptly.choose(
        'What would you like to do? ',
        choices.map(c => c.key),
        { trim: true, retry: true }
    )
    const choicesAvailableNow = await actions.takeAction(answer, { vuln })

    if (choicesAvailableNow !== undefined) {
        return optionsPrompt({ vuln }, choicesAvailableNow)
    } else {
        return answer
    }
}

export default {
    /**
     *
     *
     * @param {VulnResolution} vuln
     * @returns
     */
    handleVuln(vuln) {
        view.printIntro(vuln)

        if ((argv.ignoreLow || rules.ignoreLowSeverity) && vuln.severity === 'low') {
            view.printLowSeverityHint()
            return actions.takeAction('i', { vuln });
        }

        return optionsPrompt({ vuln })
    },
    askToFix(vulns) {
        view.printFixPrompt(vulns.filter(vuln => vuln.fixAvailable).length)

        return optionsPrompt({ vuln: vulns }, [{
            key: 'f',
            name: 'Run: npm/yarn audit fix'
        }])
    }
};