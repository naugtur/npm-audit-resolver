#!/usr/bin/env node
import ciDetect from '@npmcli/ci-detect';
import pkgFacade from './src/pkgFacade/index.js';
import view from './src/views/general.js';
import _args from 'audit-resolve-core/arguments.js';
import auditResolver from './src/resolve/auditResolver.js';

const argv = _args.get();
const isCi = ciDetect();

if (isCi && !argv.trustmeitsnotci) {
    view.ciDetected()
    process.exit(1)
}

// if (argv.yarn) {
//     pkgFacade.addImplementation('yarn', require('./src/pkgmanagers/yarn'))
//     pkgFacade.setActiveImplementation('yarn')
// } else if (argv["yarn-berry"]) {
//     pkgFacade.addImplementation('yarn-berry', require('./src/pkgmanagers/yarnBerry'))
//     pkgFacade.setActiveImplementation('yarn-berry')
// } else {
//     pkgFacade.addImplementation('npm', require('./src/pkgmanagers/npm'))
//     pkgFacade.setActiveImplementation('npm')
// }

pkgFacade.init().then(() => pkgFacade.getAudit({ shellOptions: { ignoreExit: true } })
    .then(async input => {
        const choice = await auditResolver.askForFix(input)
        if (choice === 'f') {
            return pkgFacade.getAudit({ shellOptions: { ignoreExit: true } })
        } else {
            return input
        }
    })
    .then(input => {
        return auditResolver.askForResolutions(input)
    })
    .catch(e => {
        view.genericError(e);
        process.exit(2);
    }));
