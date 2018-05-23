#!/usr/bin/env node
const flatten = require('flatten');
const promiseCommand = require('./src/promiseCommand');
const prompter = require('./src/prompter');
const statusManager = require('./src/statusManager');

promiseCommand('npm audit --json', { ignoreExit: true })
    .then(JSON.parse)
    .then(input => {
        console.log(`Total of ${input.actions.length} actions to process`)
        return input.actions
        .map(statusManager.addStatus)
        .filter(a=>{
            if(a.humanReviewComplete){
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
    })
    .then(() => console.log('done.'))
    .catch(e => console.error(e));

// console.log(input)
// console.log(generateFixes(input.actions))
// analyzeAdvisories(input.advisories).then(console.log)
//

// function generateFixes (actions) {
//   return [
//     ...actions.filter(a => a.action === 'install').map(a => `npm install ${a.module}@${a.target}`),
//     ...actions.filter(a => a.action === 'update').map(a => `npm install ${a.module}@${a.target}`),
//     ...actions.filter(a => !['install', 'update'].includes(a.action)).map(a => `${a.action} ${a.module}`)
//   ]
// }
//
// function analyzeAdvisories (advisories) {
//   console.log(Object.values(advisories))
//   const todo = Object.values(advisories).reduce((acc, a) =>
//     acc.concat(a.findings.map(finding => ({firstChain: finding.paths[0].split('>').reverse(), version: finding.version, advisedVersion:a.patched_versions})))
//           //TODO: parse advisedVersion
//   , [])
//   return Promise.all(todo.map(t => {
//     const targetPackage = t.firstChain.shift()
//     return findFeasibleUpdate(targetPackage, t.advisedVersion, t.firstChain)
//   }))
//
//
// }
