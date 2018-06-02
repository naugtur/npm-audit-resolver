const promiseCommand = require("./promiseCommand");
const resolutionState = require("./resolutionState");
const investigate = require("./investigate");

function saveResolutionAll(action, resolution) {
    action.resolves.map(re => resolutionState.set(
        { id: re.id, path: re.path },
        resolution
    ))

    return resolutionState.flush()
}
function saveResolution(singleResolve, resolution) {
    resolutionState.set(
        { id: singleResolve.id, path: singleResolve.path },
        resolution
    );
    return resolutionState.flush()
}

const LATER = 24 * 60 * 60 * 1000;

const strategies = {
    i: function ignore({ action, advisories, command }) {
        return saveResolutionAll(action, { ignore: 1 });
    },
    r: function remindLater({ action, advisories, command }) {
        return saveResolutionAll(action, { remind: Date.now() + LATER });
    },
    f: function fix({ action, advisories, command }) {
        console.log("Fixing!");
        return promiseCommand(command).then(() =>
            saveResolutionAll(action, { fix: 1 })
        );
    },
    '?': function investigateIt({ action, advisories, command }) {
        console.log("Investigating!");
        return investigate.findFeasibleResolutions({ action, advisories })
    },
    s: function abort() {
        console.log("Skipped");
    },
    q: function abort() {
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
