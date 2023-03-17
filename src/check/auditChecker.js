const { getResolution, RESOLUTIONS } = require('audit-resolve-core');
// TODO: get rules from the file via core (I'd have to check if they're properly exposed now)

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
                // TODO: add  a check: if the item is ignored and its severity is too high, return as unresolved anyway
                if (resolution) {
                    if (resolution === RESOLUTIONS.EXPIRED) {
                        unresolved = true
                    }
                    if (resolution === RESOLUTIONS.NONE) {
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