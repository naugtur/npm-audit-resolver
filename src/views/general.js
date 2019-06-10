const view = {
    totalActions(length) {
        console.log(`Total of ${length} actions to process`);

    },
    genericError(err) {
        console.error(err)
    }

}
module.exports = view
