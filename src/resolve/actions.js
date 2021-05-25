const pkgFacade = require('../pkgFacade')
// const investigate = require('../investigate');
const view = require('../views/decisions')
const { RESOLUTIONS, saveResolution } = require('audit-resolve-core')
const ONE_WEEK_LATER = Date.now() + 7 * 24 * 60 * 60 * 1000
const TWO_WEEKS_LATER = Date.now() + 14 * 24 * 60 * 60 * 1000
const MONTH_LATER = Date.now() + 30 * 24 * 60 * 60 * 1000
const NEVER = undefined

function getIdentifiers(vuln){
    return vuln.paths.map(path=>({path, id:vuln.id}))
}

const strategies = {
    i: function ignore() {
        view.printIgnoreQuestion()
        return [
            {
                key: 'M',
                name: 'ignore for a month'
            },
            {
                key: 'W',
                name: 'ignore for a week'
            },
            {
                key: '!',
                name: 'ignore permanently'
            },
        ]
    },
    W: function ignoreWeek({ vuln }) {
        return saveResolution(getIdentifiers(vuln), { resolution: RESOLUTIONS.IGNORE, expiresAt: ONE_WEEK_LATER });
    },
    M: function ignoreMonth({ vuln }) {
        return saveResolution(getIdentifiers(vuln), { resolution: RESOLUTIONS.IGNORE, expiresAt: MONTH_LATER });
    },
    '!': function ignoreForever({ vuln }) {
        return saveResolution(getIdentifiers(vuln), { resolution: RESOLUTIONS.IGNORE, expiresAt: NEVER });
    },
    r: function remindLater({ vuln }) {
        return saveResolution(getIdentifiers(vuln), { resolution: RESOLUTIONS.POSTPONE });
    },
    f: function fix({ vuln }) {
        view.printDecision('Fix!');
        //TODO: make this work...
        console.log(`Option to fix individual dependencies can't be implemented across package managers and their versions now.
        Please run your default fix command 'npm audit fix'. 
        Your decision to fix was recorded in resolutions file.`)
        saveResolution(getIdentifiers(vuln), { resolution: RESOLUTIONS.FIX })
        // return pkgFacade.fix({ vuln }).then(() =>
        //     saveResolution(getIdentifiers(vuln), { resolution: RESOLUTIONS.FIX })
        // );
    },
    del: function del({ vuln }) {
        view.printDecision('Remove');
        const uniqueNames = vuln.paths.reduce((mem, path) => {
            const topModule = path.split('>')[0]
            if (topModule) {
                mem[topModule] = true
            }
            return mem
        }, {})
        return pkgFacade.remove({ names: Object.keys(uniqueNames) })
            .then(() =>
                saveResolution(getIdentifiers(vuln), { resolution: RESOLUTIONS.NONE, reason: 'package was removed', expiresAt: TWO_WEEKS_LATER })
            );
    },
    // '?': function investigateIt({ action }) {
    //     console.log('Investigating!');
    //     return investigate.findFeasibleResolutions({ action })
    // },
    s: function skip() {
        view.printDecision('Skip');
    },
    q: function abort() {
        view.printDecision('Bye!');
        process.exit(1);
    }
};

const noop = () => console.log('doing nothing');
function strategyOf(choice) {
    return strategies[choice] || noop;
}

module.exports = {
    /**
     *
     *
     * @param {string} choice
     * @param {VulnResolution} vuln
     * @returns
     */
    takeAction(choice, vuln) {
        return strategyOf(choice)(vuln);
    }
};
