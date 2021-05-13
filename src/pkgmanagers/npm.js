const unparse = require('../unparse')
const skipArgs = require('../skipArgs')

function getCommand(action) {
    // Derived from npm-audit-report
    // TODO: share the code
    if (action.action === 'install') {
        const isDev = action.resolves[0].dev
        return `npm install ${isDev ? '--save-dev ' : ''}${action.module}@${action.target}`
    } else {
        return `npm update ${action.module} --depth ${action.depth}`
    }
}


function reformatFromV2(input){
    const vulns = input.vulnerabilities;
    const paths = {}
    const recordPath = (via, fixAvailable, acc) => {
        if(!paths[acc]){
            paths[acc]=[];
        }
        paths[acc].push({
            id: via.source,
            name: via.name,
            title: via.title,
            url: via.url,
            severity: via.severity,
            range: via.range,
            fixAvailable,
            path: acc

        })
    }
    const indexPaths = (name, accumulator) => {
        const vuln = vulns[name]
        if(accumulator){
            accumulator+=`>${name}`
        } else {
            accumulator = name
        }

        vuln.via.forEach(via => {
            if (typeof via === "string") {
                indexPaths(via, accumulator)
            } else {
                recordPath(via, vuln.fixAvailable, accumulator)
            }
        })
    }

    Object.keys(vulns).forEach(name => indexPaths(name))
    return paths;
    // .
    // {
    // "name": "base64url",
    //   path: "", //index paths form via 
    //   id: input..via.source,
    //   "title": "Out-of-bounds Read",
    //       "url": "https://npmjs.com/advisories/658",
    //       "severity": "moderate",
          
    //   "range": "<3.0.0",
      
    //   "fixAvailable": {
    //     "name": "base64url", //module
    //     "version": "3.0.1", //target
    //     "isSemVerMajor": true //isMajor
    //   }
    // }
}

function reformat(input){
    switch(input.auditReportVersion){
        case 2:
            return reformatFromV2(input)
        default: 
            return reformatFromLegacy(input)
    } 
}

module.exports = {
    version: 1,
    getAudit({ promiseCommand, argv, shellOptions }) {
        const unparsed = unparse(argv, skipArgs)
        
        return promiseCommand(`npm audit --json ${unparsed}`, shellOptions)
            .then(output => {
                try {
                    return JSON.parse(output)
                } catch (e) {
                    console.error('failed to parse output')
                    console.error(output)
                    throw e;
                }
            })
            .then(parsed => {
                if (parsed.error) {
                    throw Error(`'npm audit' failed with ${parsed.error.code}. Check the log above for more details.`);
                }
                return parsed
            })
            .then(reformat)
            .then(console.log)
        //TODO: retries on ENOAUDIT
    },
    fix({ promiseCommand, argv, shellOptions, action }) {

        return promiseCommand(getCommand(action), shellOptions)
    },
    remove({ promiseCommand, argv, shellOptions, names }) {
        //TODO: include the fact that some of them are dev dependencies and we don't know which, because we shouldn't have to at this point
        //FIXME: this command might not delete everything as expected
        return promiseCommand(`npm rm ${names.join(' ')}`, shellOptions)
    }
}