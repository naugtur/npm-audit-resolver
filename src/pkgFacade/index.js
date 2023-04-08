import _args from 'audit-resolve-core/arguments.js';
import { promiseCommand } from '../promiseCommand.js';

const argv = _args.get();

let currentActiveRunner;
function setActiveImplementation(name) {
    currentActiveRunner = name
}

const runners = {
}

function runner(pkgmanager) {
    pkgmanager = pkgmanager || currentActiveRunner
    return runners[pkgmanager]
}

export default {
    async init() {
        if (argv.yarn) {
            const { default: yarn } = await import('../pkgmanagers/yarn.js');

            this.addImplementation('yarn', yarn)
            this.setActiveImplementation('yarn')
        } else if (argv["yarn-berry"]) {
            const { default: yarnBerry } = await import('../pkgmanagers/yarnBerry.js');

            this.addImplementation('yarn-berry', yarnBerry)
            this.setActiveImplementation('yarn-berry')
        } else {
            const { default: npm } = await import('../pkgmanagers/npm.js');

            this.addImplementation('npm', npm)
            this.setActiveImplementation('npm')
        }
    },

    addImplementation(name, implementation) {
        if (!typeof implementation.getAudit === 'function') {
            throw Error('Package Manager implementation must expose a getAudit function returning a promise for audit data.')
        }
        if (!implementation.version === 1) {
            throw Error(`expected version to be set to 1 on implementation, got ${implementation.version} instead`)
        }

        runners[name] = implementation
        // enable first by default
        if (!currentActiveRunner) {
            setActiveImplementation(name)
        }
    },
    setActiveImplementation,

    /**
     *
     *
     * @param {*} { pkgmanager, shellOptions }
     * @returns {Promise<Array<Vuln>>} list of vulnerabilities
     */
    getAudit({ pkgmanager, shellOptions }) {
        return this.init().then(() => runner(pkgmanager).getAudit({
            promiseCommand,
            argv: Object.assign({}, argv),
            shellOptions
        }).then(output => {
            try {
                if (typeof output === 'string') {
                    return JSON.parse(output)
                } else {
                    return output
                }
            } catch (e) {
                console.error('failed to parse output')
                console.error(output)
                throw e;
            }
        }));
        //TODO: assert valid output format
    },
    remove({ pkgmanager, shellOptions, names }) {
        return runner(pkgmanager).remove({
            promiseCommand,
            argv: Object.assign({}, argv),
            shellOptions,
            names
        })
    },
    fix({ pkgmanager, shellOptions } = {}) {
        return runner(pkgmanager).fix({
            promiseCommand,
            argv: Object.assign({}, argv),
            shellOptions
        })
    }
}
