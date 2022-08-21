const promiseCommand = require('../../src/promiseCommand')
const assert = require('assert');

function announce(title) {
    console.log(`\n╭${'─'.repeat(title.length+2)}╮\n│`, title,`│\n╰${'─'.repeat(title.length+2)}╯\n`)
}

const test = {
    command: async ({ title, command, exitCode, shellOptions, prepare }) => {
        announce(title)
        if(prepare) {
            console.log('[prepare]')
            await promiseCommand(prepare.command, prepare.shellOptions || {})
        }
        console.log('[run]')
        if (!exitCode) {
            return assert.doesNotReject(async () => await promiseCommand(command, shellOptions || {}))
        }
        return await promiseCommand(command, shellOptions || {}).catch(e => {
            assert.strictEqual(e.exitCode, exitCode, `Expected exit code to be ${exitCode}, got ${e.exitCode}`)
        })
    },
    mock: async ({ title, mock, exitCode, shellOptions }) => {
        announce(title)
        if (!exitCode) {
            return assert.doesNotReject(async () => await promiseCommand(`node check.js --mock=test/e2e/${mock}.json`, shellOptions || {}))
        }
        return await promiseCommand(`node check.js --mock=test/e2e/${mock}.json`, shellOptions || {}).catch(e => {
            assert.strictEqual(e.exitCode, exitCode, `Expected exit code to be ${exitCode}, got ${e.exitCode}`)
            return e
        })
    },
    mockNoAssert: async ({ title, mock, exitCode, shellOptions }) => {
        announce(title)
        return await promiseCommand(`node check.js --mock=test/e2e/${mock}.json`, shellOptions || {})
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
   


    await test.command({
        title: 'runs check on npm',
        command: 'node check.js'
    })

    
    await test.command({
        title: 'runs check on yarn',
        command: 'node check.js --yarn3',
        prepare: {
            command: 'yarn set version berry'
        }
    })
    await test.command({
        title: 'runs check on yarn',
        command: 'node check.js --yarn',
        prepare: {
            command: 'yarn set version classic'
        }
    })

    await test.mockNoAssert({
        title: 'run check on difficult tree',
        mock: 'mgdodge',
        shellOptions: { ignoreExit: true }
    }).then(output => {
        assert.match(output, /^Total of 14 actions to process/, 'Should have found 14 actions')
    })


    announce(' test.js - all passed  ')
}
run()


