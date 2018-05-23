const promiseCommand = require("./promiseCommand");
const resolutionState = require("./resolutionState");

function saveResolution(action, resolution) {
        action.resolves.map(re => {
            return resolutionState.set(
                { id: re.id, path: re.path },
                resolution
            );
        })

        return resolutionState.flush()
}

const LATER = 24 * 60 * 60 * 1000;

const strategies = {
    i: function ignore({ action, advisories, command }) {
        return saveResolution(action, { ignore: 1 });
    },
    r: function remindLater({ action, advisories, command }) {
        return saveResolution(action, { remind: Date.now() + LATER });
    },
    f: function fix({ action, advisories, command }) {
        console.log("Fixing!");
        return promiseCommand(command).then(() =>
            saveResolution(action, { fix: 1 })
        );
    },
    x: function abort() {
        console.log("Aborting. Bye!");
        process.exit(1);
    }
};

const noop = () => console.log("doing nothing");
function strategyOf(choice) {
    return strategies[choice] || noop;
}

module.exports = {
    takeAction(choice, details) {
        return strategyOf(choice)(details);
    }
};
