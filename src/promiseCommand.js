const spawnShell = require('spawn-shell');
const concat = require('concat-stream');
const argv = require('./arguments').get();
const fs = require('fs')

function readMock(file, command) {
  command = command.trim()
  const mock = JSON.parse(fs.readFileSync(file))
  const commandOutput = mock[command]
  if (!commandOutput) {
    throw Error(`no mock for '${command}' in ${file}`)
  }
  if (typeof commandOutput === 'string') {
    return commandOutput
  } else {
    return JSON.stringify(commandOutput)
  }
}
module.exports = function promiseCommand(command, opts = {}) {
  if (argv.mock) {
    if (typeof argv.mock === 'string') {
      console.error(`>>mock>> '${command}'`);
      return Promise.resolve(readMock(argv.mock, command))
    }
  }
  if (!argv.json) {
    console.log('>>>>', command);
  }
  const pSpawn = spawnShell(command, Object.assign({
    stdio: [0, 'pipe', 2],
    env: process.env
  }, opts))

  const pOutput = new Promise((resolve, reject) => {
    pSpawn.stdout.pipe(concat(
      { encoding: 'string' },
      output => {
        resolve(output)
      }
    )
    ).on('error', reject)
  })

  return Promise.all([
    pSpawn.exitPromise
      .then((exitCode) => {
        if (opts.ignoreExit || exitCode === 0) {
          return
        } else {
          throw Error('Exit ' + exitCode)
        }
      }),
    pOutput]).then(arr => arr[1])
}
