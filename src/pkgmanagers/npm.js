import unparse from '../unparse.js';
import skipArgs from '../skipArgs.js';

function reformatFromV2(input) {
    const vulns = input.vulnerabilities;
    const reindex = {}
    const recordPath = (via, fixAvailable, accumulator) => {
        const acc = accumulator.join('>');
        const key = `${via.source}|${via.name}`;
        if (!reindex[key]) {
            reindex[key] = {
                id: via.source,
                name: via.name,
                title: via.title,
                url: via.url,
                severity: via.severity,
                range: via.range,
                fixAvailable,
                paths: [acc]
            }
        } else {
            reindex[key].paths.push(acc)
        }
    }
    const indexPaths = (name, accumulator) => {
        const vuln = vulns[name]
        if (accumulator) {
            if (accumulator.includes(name)) {
                return; //breaking a cycle
            }
            accumulator.push(name)
        } else {
            accumulator = [name]
        }

        vuln.via.forEach(via => {
            if (typeof via === "string") {
                indexPaths(via, accumulator)
            } else {
                recordPath(via, vuln.fixAvailable, accumulator)
            }
        })
    }
    const effectsNoOther = (name) => {
        const vuln = vulns[name]
        return vuln.effects.length === 0
    }
    // start with direct dependencies and only then move down the 'via' tree. vulnerabilities are a flat list of also transitive dependencies
    // include items that would not otherwise be found since there's nothing pointing to them
    Object.keys(vulns).filter(a => vulns[a].isDirect || effectsNoOther(a)).forEach(name => indexPaths(name))
    return Object.values(reindex);
}

function reformatFromLegacy(input) {
    const reindex = {}
    if (input.actions) {
        input.actions.forEach(action => {
            action.resolves.forEach(re => {
                const key = `${re.id}|${action.module}`;
                if (reindex[key]) {
                    reindex[key].paths.push(re.path)
                } else {
                    const adv = input.advisories[re.id]
                    reindex[key] = {
                        id: re.id,
                        name: action.module,
                        title: adv.title,
                        url: adv.url,
                        severity: adv.severity,
                        range: adv.vulnerable_versions,
                        fixAvailable: !!action.target && {
                            name: action.module,
                            version: action.target,
                            isSemVerMajor: action.isMajor
                        },
                        paths: [re.path]
                    }
                }
            })
        })
    }
    return Object.values(reindex);
}

function reformat(input, ls) {
    switch (input.auditReportVersion) {
        case 2:
            return reformatFromV2(input, ls)
        default:
            return reformatFromLegacy(input)
    }
}

const handleOutput = (of, output) => {
    let parsed
    // console.log(`>>${of} ${output.substr(0,10)}`)
    try {
        parsed = JSON.parse(output)
    } catch (e) {
        console.error(`failed to parse output of ${of}`)
        console.error(output)
        throw e;
    }
    if (parsed.error) {
        throw Error(`'${of}' failed with ${parsed.error.code}. Check the log above for more details.`);
    }
    return parsed
}

export default {
    version: 1,
    getAudit({ promiseCommand, argv, shellOptions }) {
        const unparsed = unparse(argv, skipArgs)

        return promiseCommand(`npm audit --json ${unparsed}`, shellOptions)
            .then((audit) => reformat(
                handleOutput('npm audit', audit)
            ))
        //TODO: retries on ENOAUDIT
    },
    remove({ promiseCommand, argv, shellOptions, names }) {
        //TODO: include the fact that some of them are dev dependencies and we don't know which, because we shouldn't have to at this point
        //FIXME: this command might not delete everything as expected
        return promiseCommand(`npm rm ${names.join(' ')}`, shellOptions)
    },
    fix({ promiseCommand, argv, shellOptions }) {
        return promiseCommand(`npm audit fix`, { ignoreExit: true, ...shellOptions})
    }
}