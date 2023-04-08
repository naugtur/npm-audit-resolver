import yargsParser from 'yargs-parser';

let argv = yargsParser(process.argv.slice(2));

export default {
    get: () => argv,
    set: a => {
        if (a) { argv = a }
    }
}