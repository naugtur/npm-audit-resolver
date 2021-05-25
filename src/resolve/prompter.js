const promptly = require('./micro-promptly');
const actions = require('./actions');
const argv = require('audit-resolve-core/arguments').get()
const view = require('../views/decisions')
const rules = require('audit-resolve-core/auditFile').getRules()

/**
 *
 *
 * @param {{vuln:VulnResolution}} { vuln }
 * @param {*} [choices=null]
 * @returns
 */
function optionsPrompt({ vuln }, choices = null) {

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


    if (vuln.fixAvailable) {
        defaultChoices.unshift({
            key: 'f',
            name: 'fix automatically'
        });
    }
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

    return promptly.choose(
        'What would you like to do? ',
        choices.map(c => c.key),
        { trim: true, retry: true }
    )
        .then(answer => actions.takeAction(answer, { vuln }))
        .then(choicesAvailableNow => {
            if (choicesAvailableNow !== undefined) {
                return optionsPrompt({ vuln }, choicesAvailableNow)
            }
        })
}




module.exports = {
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
    }
};