const { getResolution, RESOLUTIONS } = require('audit-resolve-core');


module.exports = {
    /**
     *
     *
     * @param {Array<Vuln>} audit
     * @returns {Array<VulnResolution} 
     */
    getUnresolved(audit = []) {
        return audit.map(item => {
            let unresolved = false;
            item.resolutions = item.paths.map(path => {
                const resolution = getResolution({ id: item.id, path })
                if (resolution) {
                    if (resolution === RESOLUTIONS.EXPIRED) {
                        unresolved = true
                    }
                    if (resolution === RESOLUTIONS.NONE) {
                        unresolved = true
                    }
                    if (resolution === RESOLUTIONS.REASON_MISSING) {
                        unresolved = true
                    }
                    if (resolution === RESOLUTIONS.REASON_MISMATCH) {
                        unresolved = true
                    }
                } else {
                    unresolved = true
                }
                return { path, resolution }

            })
            if (unresolved) {
                return item
            }
        }).filter(a => a);
    }
}