const view = {
    ciDetected() {
        console.error(`'resolve-audit' is the interactive wizard to make decisions and should not be used in CI. Use 'check-audit' instead. It's a wrapper of 'npm audit' that takes your decisions into account.`)
    },
    totalActions(length) {
        console.log(`Total of ${length} actions to process`);

    },
    genericError(err) {
        console.error(err)
    }

}

export default view;