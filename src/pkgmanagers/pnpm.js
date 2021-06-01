const unparse = require('../unparse')
const skipArgs = require('../skipArgs')

function getCommand(action) {
  // Derived from pnpm-audit-report
  // TODO: share the code
  if (action.action === 'install') {
    const isDev = action.resolves[0].dev
    return `pnpm install ${isDev ? '--save-dev ' : ''}${action.module}@${action.target}`
  } else {
    return `pnpm update ${action.module} --depth ${action.depth}`
  }
}

module.exports = {
  version: 1,
  getAudit({ promiseCommand, argv, shellOptions }) {
    const unparsed = unparse(argv, skipArgs)

    return promiseCommand(`pnpm audit --json ${unparsed}`, shellOptions)
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
          throw Error(`'pnpm audit' failed with ${parsed.error.code}. Check the log above for more details.`);
        }
        return parsed
      })
    //TODO: retries on ENOAUDIT
  },
  fix({ promiseCommand, argv, shellOptions, action }) {

    return promiseCommand(getCommand(action), shellOptions)
  },
  remove({ promiseCommand, argv, shellOptions, names }) {
    //TODO: include the fact that some of them are dev dependencies and we don't know which, because we shouldn't have to at this point
    //FIXME: this command might not delete everything as expected
    return promiseCommand(`pnpm rm ${names.join(' ')}`, shellOptions)
  }
}
