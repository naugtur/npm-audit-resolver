const packageJSON = require(require('path').resolve('./package.json'))
const jsonlines = require('jsonlines')
const unparse = require('../unparse')
const skipArgs = require('../skipArgs')


function aggregateActions(audit, entry) {
    const modulename = entry.data.advisory.module_name
    if (!audit.actions[modulename]) {
        audit.actions[modulename] = {
            //TODO: dig through npm audit to find the logic of getting those
            action: 'update', //no idea what's the difference between update and install really
            target: 'noidea', //derive from entr.data.advisory.patched_versions 
            module: modulename,
            depth: 0,
            resolves: []
        }
    }

    audit.actions[modulename].depth = Math.max(audit.actions[modulename].depth, entry.data.resolution.path.split('>').length)
    audit.actions[modulename].resolves.push(entry.data.resolution)
    audit.advisories[entry.data.advisory.id] = entry.data.advisory

    return entry.data
}

function reformat(result) {
    return {
        actions: Object.keys(result.actions).map(key => result.actions[key]),
        advisories: result.advisories
    }
}


module.exports = {
    version: 1,
    getAudit({ promiseCommand, argv, shellOptions }) {
        console.error('WARNING: yarn support is experimental')
        const unparsed = unparse(argv, skipArgs)
        
        return promiseCommand(`yarn audit --json ${unparsed}`, shellOptions)
            .then(output => {
                const result = { actions: {}, advisories: {} }
                const parser = jsonlines.parse()

                const parsing = new Promise((resolve, reject) => {
                    parser.on('data', (line) => {
                        if (line.type === 'auditAdvisory') {
                            aggregateActions(result, line)
                        }
                    })

                    parser.on('end', () => resolve(reformat(result)))
                    parser.on('error', reject)
                })

                parser.write(output)
                parser.end()

                return parsing
            })
    },
    fix({ promiseCommand, argv, shellOptions, action }) {
        console.error('WARNING: yarn support for fixing dependencies is experimental.')
        if (action.action === 'install') {
            const isDev = packageJSON.devDependencies && packageJSON.devDependencies[action.module] !== undefined;
            return promiseCommand(`yarn add ${isDev ? '--dev ' : ''}${action.module}@${action.target}`, shellOptions)
        } else {
            return promiseCommand(`yarn upgrade ${action.module}`, shellOptions)
        }

    },
    remove({ promiseCommand, argv, shellOptions, names }) {
        return promiseCommand(`yarn remove ${names.join(' ')}`, shellOptions)
    }
}