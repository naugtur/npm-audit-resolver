const CONSTS = require('../CONSTS')

module.exports = {
    printSkipping(item){
        console.log(
            `skipping ${item.module} issue based on decision ${item.decision} from ${CONSTS.FILENAME}`
        )
    }
}