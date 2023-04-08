import auditResolveCore from 'audit-resolve-core';

const { getResolution, RESOLUTIONS } = auditResolveCore;

/**
 *
 *
 * @param {Array<Vuln>} audit
 * @returns {Array<VulnResolution}
 */
export default function getUnresolved(audit = []) {
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