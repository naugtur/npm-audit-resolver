import yargsUnparse from 'yargs-unparser';

export default function unparse(argv, filteredKeys = []) {
    const filteredArgs = Object.assign({}, argv);
    
    filteredKeys.forEach(key => {
        delete filteredArgs[key];
    });

    const unparsed = yargsUnparse(filteredArgs).join(' ');
    // Dummy fix for npm6 args parsing inconsistency
    // I hope it doesn't hurt later :|
    return unparsed.replace('--omit ','--omit=');
}