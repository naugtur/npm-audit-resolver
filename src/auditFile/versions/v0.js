module.exports = {
    schema: {

    },
    extract(data) {
        return Object.keys(data).reduce((acc, key) => {
            acc[key] = Object.assign({ when: 0 }, data[key])
            return acc
        }, {})
    }
}