const promptly = require('./micro-promptly');
const actions = require('./actions');
const argv = require('../core/arguments').get()
const view = require('../views/decisions')
const rules = require('../core/auditFile').getRules()

function optionsPrompt({ action, advisories }, choices = null) {
    const actionName = action.action;

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
            key: 'd',
            name: 'show more details and ask me again'
        },
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


    if (['install', 'update'].includes(actionName)) {
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
        .then(answer => actions.takeAction(answer, { action, advisories }))
        .then(choicesAvailableNow => {
            if (choicesAvailableNow !== undefined) {
                return optionsPrompt({ action, advisories }, choicesAvailableNow)
            }
        })
}




module.exports = {
    handleAction(action, advisories) {
        view.printActionIntro(action)
        const groupedResolutions = action.resolves.reduce((groups, re) => {
            groups[re.id] = groups[re.id] || [];
            groups[re.id].push(view.buildEntryForResolution(re));
            return groups;
        }, {});
        let onlyLow = true;
        Object.keys(groupedResolutions).forEach(reId => {
            const adv = advisories[reId];
            if (adv.severity !== 'low') {
                onlyLow = false
            }
            view.printResolutionGroupInfo(groupedResolutions[reId], adv)
        });
        if ((argv.ignoreLow || rules.ignoreLowSeverity) && onlyLow) {
            view.printLowSeverityHint()
            return actions.takeAction('i', { action, advisories });
        }

        return optionsPrompt({ action, advisories })
    }
};