const jsonlines = require('jsonlines')
const unparse = require('../unparse')
const skipArgs = require('../skipArgs')


module.exports = {
    version: 1,
    getAudit({ promiseCommand, argv, shellOptions }) {
        const unparsed = unparse(argv, skipArgs)
        const reindex = {}
        const aggregate = (entry)=>{
            const re = entry.data.resolution;
            const adv = entry.data.advisory;
            const key = `${re.id}|${adv.module_name}`;
            if(reindex[key]){
                reindex[key].paths.push(re.path)
            } else {
                reindex[key]={
                    id: re.id,
                    name: adv.module_name,
                    title: adv.title,
                    url: adv.url,
                    severity: adv.severity,
                    range: adv.vulnerable_versions,
                    fixAvailable: null, //not in yarn output
                    paths: [re.path]
                }
            }
        }
        
        return promiseCommand(`yarn audit --json ${unparsed}`, shellOptions)
            .then(output => {
                const parser = jsonlines.parse()

                const parsing = new Promise((resolve, reject) => {
                    parser.on('data', (line) => {
                        if (line.type === 'auditAdvisory') {
                            aggregate(line)
                        }
                    })

                    parser.on('end', () => resolve(Object.values(reindex)))
                    parser.on('error', reject)
                })

                parser.write(output)
                parser.end()

                return parsing
            })
    },
    remove({ promiseCommand, argv, shellOptions, names }) {
        return promiseCommand(`yarn remove ${names.join(' ')}`, shellOptions)
    },
    fix({ promiseCommand, argv, shellOptions }) {
        console.log('For this to work, yarn-audit-fix package is needed.')
        return promiseCommand(`yarn audit fix`, shellOptions)
    }
}