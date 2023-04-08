import spawnShell from 'spawn-shell';
import concat from 'concat-stream';
import _args from 'audit-resolve-core/arguments.js';
import fs from 'node:fs';

const argv = _args.get();

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

export function promiseCommand(command, opts = {}) {
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
    stdio: [0, 'pipe', 'inherit'],
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
        if (opts.handleExit) {
          opts.handleExit(exitCode)
        }
        if (opts.ignoreExit || exitCode === 0) {
          return
        } else {
          const error = Error('Exit ' + exitCode)
          error.exitCode = exitCode
          throw error
        }
      }),
    pOutput]).then(arr => arr[1])
}
