const promiseCommand = require('../../src/promiseCommand')
const assert = require('assert');

const test = {
    command: async ({ title, command, exitCode, shellOptions }) => {
        console.log(title)
        if (!exitCode) {
            return assert.doesNotReject(async () => await promiseCommand(command, shellOptions || {}))
        }
        return await promiseCommand(command, shellOptions || {}).catch(e => {
            assert.strictEqual(e.exitCode, exitCode, `Expected exit code to be ${exitCode}, got ${e.exitCode}`)
        })
    },
    mock: async ({ title, mock, exitCode, shellOptions }) => {
        console.log(title)
        if (!exitCode) {
            return assert.doesNotReject(async () => await promiseCommand(`node check.js --mock=test/e2e/${mock}.json`, shellOptions || {}))
        }
        return await promiseCommand(`node check.js --mock=test/e2e/${mock}.json`, shellOptions || {}).catch(e => {
            assert.strictEqual(e.exitCode, exitCode, `Expected exit code to be ${exitCode}, got ${e.exitCode}`)
        })
    },
}

async function run() {
    await test.mock({
        title: 'run check on clean audit npm6',
        mock: '6cleanAudit'
    })
    await test.mock({
        title: 'run check on clean audit npm7',
        mock: '7cleanAudit'
    })
    await test.mock({
        title: 'run check and get it to exit 1 for vulns found 6',
        mock: '6bigAudit',
        exitCode: 1
    })
    await test.mock({
        title: 'run check and get it to exit 1 for vulns found 7',
        mock: '7bigAudit',
        exitCode: 1
    })
    await test.mock({
        title: 'run check witn npm7 output where "via" form a cyclic graph',
        mock: '7cycleAudit',
        exitCode: 1
    })
    await test.command({
        title: 'run check and get it to exit 1 for vulns found yarn',
        command: 'node check.js --yarn --mock=test/e2e/ybigAudit.json --json',
        exitCode: 1
    })
    await test.mock({
        title: 'run check on a broken audit 6',
        mock: '6noAudit',
        exitCode: 2
    })
    await test.mock({
        title: 'run check on a broken audit 7',
        mock: '7noAudit',
        exitCode: 2
    })
}
run()


