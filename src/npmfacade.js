const fs = require('fs');
const promiseCommand = require('./promiseCommand');



const argv = require('yargs-parser')(process.argv.slice(2));

let seq = 0;
const runner = argv.mock ? 
    (command) => {
        console.log('>>>mock ', command) 
        return Promise.resolve(fs.readFileSync(`mock-${command.substr(0,4)}.json`)) 
    }
    : 
    (command, opts) => promiseCommand('npm ' + command + ' --json', opts);

module.exports = {
    runNpmCommand(command, opts) {
        return runner(command, opts).then(JSON.parse)
    }
}