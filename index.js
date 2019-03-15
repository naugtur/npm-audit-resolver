#!/usr/bin/env node
const prompter = require('./src/prompter');
const statusManager = require('./src/statusManager');
const argv = require('./src/arguments')

function countVulnerabilities(advisories, severity) {
    return Object.keys(advisories)
        .reduce((count, advisoryKey) => advisories[advisoryKey].severity === severity ? count + 1 : count, 0);
}

module.exports = {
    resolveAudit(input, args) {
        argv.set(args)
        return input.actions
            .map(statusManager.addStatus)
            .filter(a => {
                if (a.humanReviewComplete) {
                    console.log(`skipping ${a.module} issue based on audit-resolv.json`)
                }
                return !a.humanReviewComplete
            })
            .reduce(
                (prev, action) =>
                    prev.then(() =>
                        prompter.handleAction(action, input.advisories)
                    ),
                Promise.resolve()
            )
    },
    skipResolvedActions(input, args) {
        argv.set(args)
        input.actions = input.actions
            .map(statusManager.addStatus)
            .filter(a => {
                if (a.humanReviewComplete) {
                    console.error(
                        `skipping ${a.module} issue based on audit-resolv.json`
                    );
                }
                return !a.humanReviewComplete;
            })
        return input
    },
    checkAudit(input, args) {
        argv.set(args)
        const relevantActions = input.actions
            .map(statusManager.addStatus)
            .filter(a => {
                if (a.humanReviewComplete && !argv.get().json) {
                    console.log(
                        `skipping ${a.module} issue based on audit-resolv.json`
                    );
                }
                return !a.humanReviewComplete;
            });
        const groups = {};
        relevantActions.forEach(action => {
                action.resolves && action.resolves.forEach(re => {
                    groups[re.id] = groups[re.id] || [];
                    let type = re.dev ? " devDependencies" : "dependencies";
                    re.optional && (type += " (optional)");
                    re.bundled && (type += " (bundled)");
                    let reportLine = ` - ${type}: ${re.path}`;
                    if (re.humanReviewStatus) {
                        re.humanReviewStatus.fix &&
                            (reportLine +=
                                "\n     ^ this issue was marked as fixed earlier");
                        re.humanReviewStatus.remind &&
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
            const adv = input.advisories[reId];
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
                input.metadata,
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
