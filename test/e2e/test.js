import { promiseCommand } from '../../src/promiseCommand.js';
import assert from 'node:assert/strict';

function announce(title) {
    console.log(`\n╭${'─'.repeat(title.length + 2)}╮\n│`, title, `│\n╰${'─'.repeat(title.length + 2)}╯\n`)
}

async function commandSequence(arr, opts={}) {
    for (let i = 0; i < arr.length; i++) {
        try {
            await promiseCommand(arr[i], opts)
        } catch(e) {
            console.log(e);
            throw e;
        }

    }
}

const test = {
    command: async ({ title, command, exitCode, shellOptions, prepare, teardown }) => {
        announce(title)
        if (prepare) {
            console.log('[prepare]')
            await commandSequence(prepare)
        }
        console.log('[run]')
        if (!exitCode) {
            await assert.doesNotReject(async () => await promiseCommand(command, shellOptions || {}))
        } else {
            await promiseCommand(command, shellOptions || {}).catch(e => {
                assert.strictEqual(e.exitCode, exitCode, `Expected exit code to be ${exitCode}, got ${e.exitCode}`)
            })
        }
        if (teardown) {
            console.log('[teardown]')
            await commandSequence(teardown)
        }
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
        title: 'runs check on npm with audit level',
        command: 'node check.js --audit-level critical',
        exitCode: 0,
        prepare: ['npm i base64url@2.0.0'],
        teardown: ['npm rm base64url']
    })
    await test.command({
        title: 'runs check on npm with audit prod',
        command: 'node check.js --omit=dev',
        exitCode: 0,
        prepare: ['npm i -D base64url@2.0.0'],
        teardown: ['npm rm base64url']
    })


    await test.command({
        title: 'runs check on yarn3',
        command: 'node check.js --yarn-berry',
        prepare: ['rm -f yarn.lock', 'yarn set version berry', 'yarn install --mode update-lockfile']
    })
    await test.command({
        title: 'runs check on yarn1',
        command: 'node check.js --yarn',
        prepare: ['rm -f yarn.lock', 'yarn set version classic', 'yarn install --mode update-lockfile']
    })

    await test.mockNoAssert({
        title: 'run check on difficult tree',
        mock: 'mgdodge',
        shellOptions: { ignoreExit: true }
    }).then(output => {
        assert.match(output, /^Total of 14 actions to process/, 'Should have found 14 actions')
    })


    announce('               test.js - all passed                 ')
}

run();


