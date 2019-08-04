// All credit for this code goes to https://github.com/clement-escolano
// I just put it here because he didn't seem to have time anymore.

const packageJSON = require(require('path').resolve('./package.json'))
const yarnToNpm = require('synp').yarnToNpm
const fs = require('fs')

function addPackageLockFromYarnIfNecessary() {
    console.error('Creating package-lock.json from yarn.lock')
    const stringifiedPackageLock = yarnToNpm('.')
    return new Promise((resolve, reject) => {
        fs.writeFile('./package-lock.json', stringifiedPackageLock, (error) => {
            if (error) {
                return reject(error)
            }
            resolve()
        })
    })
}

function removePackageLockIfNecessary(input) {
    // Do nothing if package-lock does not exist
    try {
        fs.statSync('./package-lock.json')
    } catch (e) {
        return input;
    }

    console.error('Removing package-lock.json')
    return new Promise((resolve, reject) => {
        fs.unlink('./package-lock.json', (error) => {
            if (error) {
                return reject(error)
            }

            // Pass through original arguments
            resolve(input)
        })
    })
}

module.exports = {
    version: 1,
    getAudit({ promiseCommand, argv, shellOptions }) {
        console.error('WARNING: yarn support is experimental')
        return addPackageLockFromYarnIfNecessary()
            .then(() => promiseCommand(`npm audit --json ${argv.registry ? `--registry ${argv.registry}` : ''}`, shellOptions))
            .finally(removePackageLockIfNecessary)
    },
    fix({ promiseCommand, argv, shellOptions, action }) {
        console.error('WARNING: yarn support for fixing dependencies is experimental.')
        if (action.action === 'install') {
            const isDev = packageJSON.devDependencies[action.module] !== undefined;
            return promiseCommand(`yarn add ${isDev ? '--dev ' : ''}${action.module}@${action.target}`, shellOptions)
        } else {
            return promiseCommand(`yarn upgrade ${action.module}`, shellOptions)
        }

    },
    remove({ promiseCommand, argv, shellOptions, names }) {
        return promiseCommand(`yarn remove ${names.join(' ')}`, shellOptions)
    }
}