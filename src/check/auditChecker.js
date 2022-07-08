const { getResolution, getValidationError, RESOLUTIONS, VALIDATIONS } = require('audit-resolve-core');


module.exports = {
    /**
     * @param {Array<Vuln>} audit
     * @returns {Array<VulnResolution}
     */
    getUnresolved(audit = []) {
        return audit.map(vuln => {
            let unresolved = false;
            let validationError = undefined;
            vuln.resolutions = vuln.paths.map(path => {
                const resolution = getResolution({ id: vuln.id, path })
                if (resolution) {
                    if (resolution === RESOLUTIONS.EXPIRED) {
                        unresolved = true
                    }
                    if (resolution === RESOLUTIONS.NONE) {
                        unresolved = true
                    }
                    validationError = getValidationError({ id: vuln.id, path });
                } else {
                    unresolved = true
                }
                return { path, resolution, validationError }
            })
            if (unresolved || validationError) {
                return vuln
            }
        }).filter(vuln => vuln);
    }
}