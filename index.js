#!/usr/bin/env node
const getStdin = require('get-stdin')
const flatten = require('flatten')
const spawnShell = require('spawn-shell')
const concat = require('concat-stream')

function promiseCommand (command, opts) {
  console.log('>>>>', command)
  const pSpawn = spawnShell(command, Object.assign({
    stdio: [0, 'pipe', 2]
  },opts))

  const pOutput = new Promise((resolve, reject) => {
    pSpawn.stdout.pipe(concat(
      {encoding: 'string'},
      output => {
        resolve(output)
      }
    )
  ).on('error', reject)
  })

  return Promise.all([
    pSpawn.exitPromise
        .then((exitCode) => {
          if (exitCode === 0) {
            return
          } else {
            throw Error('Exit ' + exitCode)
          }
        }),
    pOutput]).then(arr => arr[1])
}

getStdin()
.then(JSON.parse)
.then(input => {
  // console.log(input)
  // console.log(generateFixes(input.actions))
  analyzeAdvisories(input.advisories).then(console.log)
})

function generateFixes (actions) {
  return [
    ...actions.filter(a => a.action === 'install').map(a => `npm install ${a.module}@${a.target}`),
    ...actions.filter(a => a.action === 'update').map(a => `npm install ${a.module}@${a.target}`),
    ...actions.filter(a => !['install', 'update'].includes(a.action)).map(a => `${a.action} ${a.module}`)
  ]
}

function analyzeAdvisories (advisories) {
  console.log(Object.values(advisories))
  const todo = Object.values(advisories).reduce((acc, a) =>
    acc.concat(a.findings.map(finding => ({firstChain: finding.paths[0].split('>').reverse(), version: finding.version, advisedVersion:a.patched_versions})))
          //TODO: parse advisedVersion
  , [])
  return Promise.all(todo.map(t => {
    const targetPackage = t.firstChain.shift()
    return findFeasibleUpdate(targetPackage, t.advisedVersion, t.firstChain)
  }))


}

function matchSemverToVersion(semver, version){
  return false
}

function findFeasibleUpdate(targetPackage, targetVersion, dependantsChain){
  return promiseCommand(`npm info ${dependantsChain[0]} --json`)
  .then(JSON.parse)
  .then(info=>{
    const semver=info.dependencies[targetPackage] || info.devDependencies[targetPackage]
    if(dependantsChain.length <= 1) {
      return 'ran out of parents to go up, this looks fixed'
    }
    if(matchSemverToVersion(semver, targetVersion)){
      //semver range includes the fix, go up
      const newTarget = dependantsChain.shift()
      //This is a bit strict, maybe we wouldn't have to force an update to latest on everything in the chain, but it'd require iterating over all versions between what's used by dependant and latest
      const newTargetVersion = info['dist-tags'].latest
      return findFeasibleUpdate(newTarget, newTargetVersion, dependantsChain)
    } else {
      return `update ${targetPackage} in ${dependantsChain[0]} to ${targetVersion}`
    }
  })
}
