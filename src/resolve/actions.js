const statusManager = require('../core/statusManager');
const pkgFacade = require('../core/pkgFacade')
const investigate = require('../investigate');
const chalk = require('chalk')
const RESOLUTIONS = require('../core/resolutions/RESOLUTIONS')
const TWO_WEEKS_LATER = Date.now() + 14 * 24 * 60 * 60 * 1000

const strategies = {
    i: function ignore({ action, advisories}) {
        return statusManager.saveResolution(action, { resolution: RESOLUTIONS.IGNORE });
    },
    r: function remindLater({ action, advisories }) {
        return statusManager.saveResolution(action, { resolution: RESOLUTIONS.POSTPONE });
    },
    f: function fix({ action, advisories }) {
        console.log('Fixing!');
        return pkgFacade.fix({ action }).then(() =>
            statusManager.saveResolution(action, { resolution: RESOLUTIONS.FIX })
        );
    },
    del: function del({ action, advisories }) {
        console.log('Removing');
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
        console.log('');

        Object.keys(action.resolves.reduce((mem, re) => {
            mem[re.id] = 1
            return mem
        }, {})).map(advId => {
            const adv = advisories[advId]
            const versions = adv.findings.map(f => f.version).join()
            console.log(`${chalk.bold(adv.module_name)} versions installed: ${chalk.bold(versions)}
${adv.overview}
${adv.recommendation}
${adv.references}`)
        })
        return null;
    },
    '?': function investigateIt({ action, advisories }) {
        console.log('Investigating!');
        return investigate.findFeasibleResolutions({ action, advisories })
    },
    s: function abort() {
        console.log('Skipped');
    },
    q: function abort() {
        console.log('Aborting. Bye!');
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
