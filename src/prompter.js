const promptly = require("promptly");
const actions = require("./actions");

module.exports = {
    handleAction(action, advisories) {
        console.log(`--------------------------------------------------`);
        console.log(`${action.module} needs your attention.`);
        const groupedResolutions = action.resolves.reduce((groups, re) => {
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
                    (reportLine += "\n     ^ this issue was already postponed");
            }
            if (re.isMajor) {
                reportLine += "\n  ! warning, fix is a major version upgrade";
            }
            groups[re.id].push(reportLine);

            return groups;
        }, {});

        Object.keys(groupedResolutions).forEach(reId => {
            const adv = advisories[reId];
            console.log(`[${adv.severity}] ${adv.title}`);
            console.log(
                ` vulnerable versions ${adv.vulnerable_versions} found in:`
            );
            console.log(groupedResolutions[reId].join("\n"));
        });

        const command = [
            "npm",
            action.action,
            action.module + "@" + action.target,
            action.depth ? "--depth " + action.depth : ""
        ].join(" ");

        return optionsPrompt(action.action, command).then(answer => {
            return actions.takeAction(answer, { action, advisories, command });
        });
    }
};

function optionsPrompt(actionName, command) {
    const choices = [
        // {
        //     key: 'd',
        //     name: 'show more details and skip'
        // },
        {
            key: "i",
            name: "ignore paths"
        },
        {
            key: "r",
            name: "remind me in 24h"
        },
        {
            key: "x",
            name: "Abort"
        }
    ];

    if (["install", "update"].includes(actionName)) {
        choices.unshift({
            key: "f",
            name: "fix with " + command
        });
    }
    console.log("_");
    console.log(choices.map(c => ` ${c.key}) ${c.name}`).join("\n"));

    return promptly.choose(
        "What would you like to do? ",
        choices.map(c => c.key),
        { trim: true, retry: true }
    );
}
