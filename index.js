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
  console.log(analyzeAdvisories(input.advisories))
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
    acc.concat(a.findings.map(finding => ({firstChain: finding.paths[0].split('>').reverse(), version: finding.version})))
  , [])
  Promise.all(todo.map(t => {
    promiseCommand(`npm info ${t.firstChain[1]} --json`)
    .then(JSON.parse)
    .then(info=>info.dependencies[t.firstChain[0]] || info.devDependencies[t.firstChain[0]])
    .then(a => console.log(`${t.firstChain[1]} depends on ${t.firstChain[0]} at ${a}`))
  }))

  //TODO next, take the version def it depends on and match against advisory, if advised version included, go up the chain. IF advised version not included, create a report

  return todo
}
