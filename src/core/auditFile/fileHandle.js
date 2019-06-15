const argv = require('../arguments')
const djv = require('djv')
const path = require('path')
const fs = require('fs')
const FILE = require('./FILE')
const migrationView = require('../views/migration')
const versions = {
    0: require('./versions/v0'),
    1: require('./versions/v1')
}

function defaultFilePath(pathOverride) {
    return pathOverride || path.resolve(argv.get().prefix || '.', FILE.FILENAME)

}

function resolutionFilePath(pathOverride) {
    const filePath1 = defaultFilePath(pathOverride)

    if (fs.existsSync(filePath1)) {
        return filePath1
    }

    const filePath2 = path.resolve(argv.get().prefix || '.', FILE.FILENAME_DEPRECATED)
    if (fs.existsSync(filePath2)) {
        migrationView.printV1MigrationNotes()
        return filePath2
    }

    throw Error(`Could not find the resolutions file. Expected ${filePath1}`)



}

function validate(JSONSchema, data) {
    const env = new djv();
    env.addSchema('resolve', JSONSchema);
    const result = env.validate('resolve', data);
    if (result) {
        throw Error(`Invalid audit-resolve file. ${JSON.stringify(result, null, 2)}`)
    }
}
function parseResolutionsData(rawdata) {
    const data = JSON.parse(rawdata);
    let version = 0;
    if (data.version) {
        version = +data.version
    }
    if (!versions[version]) {
        throw Error(`Unrecognized ${FILE.FILENAME} content version ${version}`)
    }
    validate(versions[version].schema, data)
    return versions[version].extract(data)

}

module.exports = {
    load(pathOverride) {
        const rawdata = fs.readFileSync(resolutionFilePath(pathOverride));
        return parseResolutionsData(rawdata)
    },
    save({decisions, rules}, pathOverride) {
        const wrappedData = {
            decisions,
            rules,
            version: 1
        }
        console.error(wrappedData)
        validate(versions[1].schema, wrappedData)
        fs.writeFileSync(defaultFilePath(pathOverride), JSON.stringify(wrappedData, null, 2))
    }
}