const pkgFacade = require('../pkgFacade')
// const investigate = require('../investigate');
const view = require('../views/decisions')
const { RESOLUTIONS, saveResolution } = require('audit-resolve-core')
const ONE_WEEK_LATER = Date.now() + 7 * 24 * 60 * 60 * 1000
const TWO_WEEKS_LATER = Date.now() + 14 * 24 * 60 * 60 * 1000
const MONTH_LATER = Date.now() + 30 * 24 * 60 * 60 * 1000
const NEVER = undefined

function getIdentifiers(vuln) {
    return vuln.paths.map(path => ({ path, id: vuln.id }))
}

const strategies = {
    i: function ignore({ vuln }) {
        view.printIgnoreQuestion()
        const subOptions = [
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
        if (vuln.fixAvailable) {
            view.printFixAvailable()
            subOptions.unshift({ key: 's', name: 'Skip, I will fix it' })
        }
        return subOptions
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
    s: function skip() {
        view.printDecision('Skip');
    },
    q: function abort() {
        view.printDecision('Bye!');
        process.exit(0);
    },
    f: async function fixAll() {
        view.printDecision('Fix all');
        // TODO: add marking all fixed items as fixed
        await pkgFacade.fix()
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
