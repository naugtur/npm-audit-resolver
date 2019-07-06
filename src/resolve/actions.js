const statusManager = require('../core/statusManager');
const pkgFacade = require('../core/pkgFacade')
// const investigate = require('../investigate');
const view = require('../views/decisions')
const RESOLUTIONS = require('../core/resolutions/RESOLUTIONS')
const ONE_WEEK_LATER = Date.now() + 7 * 24 * 60 * 60 * 1000
const TWO_WEEKS_LATER = Date.now() + 14 * 24 * 60 * 60 * 1000
const MONTH_LATER = Date.now() + 30 * 24 * 60 * 60 * 1000
const NEVER = undefined

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
    W: function ignoreWeek({ action, advisories }) {
        return statusManager.saveResolution(action, { resolution: RESOLUTIONS.IGNORE, expiresAt: ONE_WEEK_LATER });
    },
    M: function ignoreMonth({ action, advisories }) {
        return statusManager.saveResolution(action, { resolution: RESOLUTIONS.IGNORE, expiresAt: MONTH_LATER });
    },
    '!': function ignoreForever({ action, advisories }) {
        return statusManager.saveResolution(action, { resolution: RESOLUTIONS.IGNORE, expiresAt: NEVER });
    },
    r: function remindLater({ action, advisories }) {
        return statusManager.saveResolution(action, { resolution: RESOLUTIONS.POSTPONE });
    },
    f: function fix({ action, advisories }) {
        view.printDecision('Fix!');
        return pkgFacade.fix({ action }).then(() =>
            statusManager.saveResolution(action, { resolution: RESOLUTIONS.FIX })
        );
    },
    del: function del({ action, advisories }) {
        view.printDecision('Remove');
        pkgFacade.removeAll({ action })
        const uniqueNames = action.resolves.reduce((mem, re) => {
            const topModule = re.path.split('>')[0]
            if (topModule) {
                mem[topModule] = true
            }
            return mem
        }, {})
        return pkgFacade.remove({ names: Object.keys(uniqueNames) })
            .then(() =>
                statusManager.saveResolution(action, { resolution: RESOLUTIONS.NONE, reason: 'package was removed', expiresAt: TWO_WEEKS_LATER })
            );
    },
    d: function details({ action, advisories }) {

        Object.keys(action.resolves.reduce((mem, re) => {
            mem[re.id] = 1
            return mem
        }, {})).map(advId => {
            view.printDetailsOfAdvisory({ advisory: advisories[advId] })
        })
        return null
    },
    // '?': function investigateIt({ action, advisories }) {
    //     console.log('Investigating!');
    //     return investigate.findFeasibleResolutions({ action, advisories })
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
    takeAction(choice, details) {
        return strategyOf(choice)(details);
    }
};
