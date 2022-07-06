const unparse = require('../unparse')
const skipArgs = require('../skipArgs')


module.exports = {
    version: 1,
    getAudit({ promiseCommand, argv, shellOptions }) {
        const unparsed = unparse(argv, skipArgs)
        const reindex = {}
        const aggregate = ({
            id,
            module_name,
            title,
            url,
            severity,
            vulnerable_versions,
            findings,
        }) => {
            // take first finding in paths list, others are for yarn workspaces
            const [path] = findings[0]?.paths ?? [];
            const key = `${id}|${module_name}`;

            if (reindex[key]) {
                reindex[key].paths.push(path);
            } else {
                reindex[key]={
                    id,
                    name: module_name,
                    title,
                    url,
                    severity,
                    range: vulnerable_versions,
                    fixAvailable: null, //not in yarn output
                    paths: [path]
                }
            }
        }

        return promiseCommand(
            `yarn npm audit --json ${unparsed}`,
            shellOptions
        ).then((output) => {
            const parsedOutput = JSON.parse(output);

            Object.values(parsedOutput.advisories ?? {}).forEach(aggregate);

            return Object.values(reindex);
        })
    },
    remove({ promiseCommand, argv, shellOptions, names }) {
        return promiseCommand(`yarn remove ${names.join(' ')}`, shellOptions)
    }
}