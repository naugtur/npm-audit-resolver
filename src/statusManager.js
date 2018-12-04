const resolutionState = require('./resolutionState');
const RESOLUTIONS = require("./RESOLUTIONS");

module.exports = {
    addStatus(action) {
        let unresolved = false;
        action.resolves.map(re => {
            const status = resolutionState.get({ id: re.id, path: re.path });
            if (status) {
                re.humanReviewStatus = status
                if (status.resolution === RESOLUTIONS.remind && Date.now() > status.remindTime) {
                    unresolved = true
                }
                if (status.resolution === RESOLUTIONS.fix) {
                    // should have been fixed!
                    unresolved = true
                }
            } else {
                unresolved = true
            }
            return re;
        });
        action.humanReviewComplete = !unresolved
        return action
    }
};
