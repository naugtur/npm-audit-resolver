const yargsUnparse = require('yargs-unparser');

function unparse(argv, filteredKeys = []) {
    const filteredArgs = Object.assign({}, argv);
    
    filteredKeys.forEach(key => {
        delete filteredArgs[key];
    });

    const unparsed = yargsUnparse(filteredArgs).join(' ');
    return unparsed;
}
module.exports = unparse;