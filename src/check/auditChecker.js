const statusManager = require('../shared/statusManager');
const {printSkipping} = require('../views/package')
module.exports = {
    dropResolvedActions(actions) {
        return actions
            .map(statusManager.addStatus)
            .filter(action => {
                if (action.isMarkedResolved) {
                    printSkipping(action)
                }
                return !action.isMarkedResolved;
            })
    }
}