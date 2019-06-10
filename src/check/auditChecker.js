const statusManager = require('../core/statusManager');
const { printSkipping } = require('../views/package')

function dropResolvedActions(actions) {
    return actions
        .map(statusManager.addStatus)
        .filter(action => {
            if (action.isMarkedResolved) {
                printSkipping(action)
            }
            return !action.isMarkedResolved;
        })
}


function countVulnerabilities(advisories, severity) {
    return Object.keys(advisories)
        .reduce((count, advisoryKey) => advisories[advisoryKey].severity === severity ? count + 1 : count, 0);
}


module.exports = {
    dropResolvedActions,
    aggregateIssuesFromAudit(audit) {
        const relevantActions = dropResolvedActions(audit.actions)
        const groups = {}
        relevantActions.forEach(action => {
            action.resolves && action.resolves.forEach(re => {
                groups[re.id] = groups[re.id] || [];
                let type = re.dev ? " devDependencies" : "dependencies";
                re.optional && (type += " (optional)");
                re.bundled && (type += " (bundled)");
                //TODO: put this in views
                let reportLine = ` - ${type}: ${re.path}`;
                if (re.decision) {
                    re.decision.fix &&
                        (reportLine +=
                            "\n     ^ this issue was marked as fixed earlier");
                    re.decision.remind &&
                        (reportLine +=
                            "\n     ^ this issue was postponed, the time ran out");
                }
                groups[re.id].push({
                    data: re,
                    report: reportLine
                });
            });
        });
        const relevantAdvisories = {};
        const issues = Object.keys(groups).map(reId => {
            const adv = audit.advisories[reId];
            relevantAdvisories[reId] = adv;
            return {
                title: adv.title,
                severity: adv.severity,
                items: groups[reId]
            }
        });
        return {
            issues,
            actions: relevantActions,
            advisories: relevantAdvisories,
            metadata: Object.assign({},
                audit.metadata,
                {
                    vulnerabilities: {
                        info: countVulnerabilities(relevantAdvisories, 'info'),
                        low: countVulnerabilities(relevantAdvisories, 'low'),
                        moderate: countVulnerabilities(relevantAdvisories, 'moderate'),
                        high: countVulnerabilities(relevantAdvisories, 'high'),
                        critical: countVulnerabilities(relevantAdvisories, 'critical')
                    }
                }
            )
        };
    }
}