const { getResolution, RESOLUTIONS } = require('audit-resolve-core');


module.exports = {
    dropResolvedActions,
    /**
     *
     *
     * @param {Array<Vuln>} audit
     * @returns {Array<VulnResolution} 
     */
    getUnresolved(audit) {
        return audit.map(item => {
            let unresolved = false;
            item.resolutions = item.paths.map(path => {
                const decision = getResolution({ id: item.id, path })
                const status = resolution //todo - check how it maps
                if (status) {
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
                return { path, decision }

            })
            if (unresolved) {
                return item
            }
        }).filter(a => a);
    }
}