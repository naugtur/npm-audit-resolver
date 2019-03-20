const path = require("path");
const assert = require("assert");
const auditFile = require("../../src/auditFile")

auditFile.load(path.resolve(__dirname,"./v1ok.json"))

assert.throws(()=>{
    auditFile.load(path.resolve(__dirname,"./v1wrong.json"))
})