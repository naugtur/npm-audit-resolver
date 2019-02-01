const yarnToNpm = require('synp').yarnToNpm
const fs = require('fs')
const argv = require('./arguments').get()

function addPackageLockFromYarnIfNecessary() {
    if (!argv.yarn) {
        return true
    }

    console.log('Creating package-lock.json from yarn.lock')
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
    if (!argv.yarn) {
        return input
    }
    // Do nothing if package-lock does not exist
    try {
        fs.statSync('./package-lock.json')
    } catch (e) {
        return input;
    }

    console.log('Removing package-lock.json')
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
    addPackageLockFromYarnIfNecessary,
    removePackageLockIfNecessary,
}
