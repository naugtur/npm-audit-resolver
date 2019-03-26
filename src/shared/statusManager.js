const auditFile = require('../auditFile');
const RESOLUTIONS = require('../RESOLUTIONS');


module.exports = {
    addStatus(action) {
        let unresolved = false;
        action.resolves.map(re => {
            const status = auditFile.get({ id: re.id, path: re.path });
            if(status){
                re.decision = status
                
                if(status = RESOLUTIONS.FIX){
                    // should have been fixed!
                    unresolved = true
                }
                if(status = RESOLUTIONS.POSTPONE_EXPIRED){
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
};
