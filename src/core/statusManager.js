const auditFile = require('./auditFile');
const RESOLUTIONS = require('./resolutions/RESOLUTIONS');

const { printSkipping } = require('./views/main')


function addStatusToAction(action) {
    let unresolved = false;
    action.resolves.map(re => {
        let status = auditFile.get({ id: re.id, path: re.path });
        if (status) {
            re.decision = status
            if (status === RESOLUTIONS.FIX) {
                // should have been fixed!
                unresolved = true
            }
            if (status === RESOLUTIONS.EXPIRED) {
                unresolved = true
            }
            if (status === RESOLUTIONS.NONE) {
                unresolved = true
            }
        } else {
            unresolved = true
        }
        return re;
    });
    action.isMarkedResolved = !unresolved
    return action
}


function saveResolution(action, { resolution, reason, expiresAt }) {
    // default expiry rules
    if (!expiresAt && resolution === RESOLUTIONS.IGNORE && auditFile.getRules().ignoreExpiresInDays) {
        expiresAt = auditFile.getRules().ignoreExpiresInDays * 24 * 60 * 60 * 1000
    }
    action.resolves.map(re => auditFile.set(
        { id: re.id, path: re.path },
        { resolution, reason, expiresAt }
    ))

    return auditFile.flush()
}

function dropResolvedActions(actions) {
    return actions
        .map(addStatusToAction)
        .filter(action => {
            if (action.isMarkedResolved) {
                printSkipping(action)
            }
            return !action.isMarkedResolved;
        })
}

module.exports = {
    dropResolvedActions,
    addStatusToAction,
    saveResolution
};
