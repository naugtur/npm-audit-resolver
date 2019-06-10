const argv = require('../arguments').get()
const promiseCommand = require('../promiseCommand');

const runners = {
    'mock': require('./mock')
}
function runner(pkgmanager) {
    return runners[pkgmanager]
}

module.exports = {
    addImplementation(name, implementation) {
        if (!typeof implementation.getAudit === 'function') {
            throw Error('Package Manager implementation must expose a getAudit function returning a promise for audit data.')
        }
        if (!implementation.version === 1) {
            throw Error(`expected version to be set to 1 on implementation, got ${implementation.version} instead`)
        }
        runners[name] = implementation
    },
    getAudit({ pkgmanager, shellOptions }) {
        if (argv.mock) {
            console.log('>>>mock get audit')
            pkgmanager = 'mock'
        }
        return runner(pkgmanager).getAudit({
            promiseCommand,
            argv: Object.assign({}, argv),
            shellOptions
        }).then(output => {
            try {
                return JSON.parse(output)
            } catch (e) {
                console.error('failed to parse output')
                console.error(output)
                throw e;
            }
        })
    }
}
