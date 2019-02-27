const statusManager = require('../shared/statusManager');
const {printSkipping} = require('../views/package')
module.exports = {
    dropResolvedActions(actions) {
        return actions
            .map(statusManager.addStatus)
            .filter(a => {
                if (a.humanReviewComplete) {
                    printSkipping(a)
                }
                return !a.humanReviewComplete;
            })
    }
}