module.exports = {
    schema: {
        "properties": {
            "type": {
              "enum": ["common"]
            }
          },
          "required": [
            "type"
          ]
    },
    extract(data) {
        return Object.keys(data).reduce((acc, key) => {
            acc[key] = { when: 0 }
            if(data[key] === 'postpone'){
                
            }
            acc[key][data[key])
            return acc
        }, {})
    }
}