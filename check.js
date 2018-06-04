#!/usr/bin/env node
const statusManager = require("./src/statusManager");
const npmFacade = require('./src/npmfacade');

npmFacade.runNpmCommand('audit', { ignoreExit: true })
    .then(input => {
        console.log(`Total of ${input.actions.length} actions to process`);
        return input.actions
            .map(statusManager.addStatus)
            .filter(a => {
                if (a.humanReviewComplete) {
                    console.log(
                        `skipping ${a.module} issue based on audit-resolv.json`
                    );
                }
                return !a.humanReviewComplete;
            })
            .forEach(action => {
                const groupedIssues = action.resolves.reduce((groups, re) => {
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
                    groups[re.id].push(reportLine);

                    return groups;
                }, {});

                let issuesFound = false;
                Object.keys(groupedIssues).forEach(reId => {
                    issuesFound = true;
                    const adv = input.advisories[reId];
                    console.log(
                        `--------------------------------------------------`
                    );
                    console.log(`[${adv.severity}] ${adv.title}`);
                    console.log(groupedIssues[reId].join("\n"));
                });

                if (issuesFound) {
                    console.log(
                        `--------------------------------------------------`
                    );
                    console.error(" 😱   Unresolved issues found!");
                    console.log(
                        `--------------------------------------------------`
                    );
                    process.exit(1);
                }
            });
    })
    .then(() => console.log("audit ok."))
    .catch(e => {
        console.error(e);
        process.exit(2);
    });
