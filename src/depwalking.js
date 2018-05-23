// Work in progress
function matchSemverToVersion(semver, version){
  return false
}

function findFeasibleUpdate(targetPackage, targetVersion, dependantsChain){
  return promiseCommand(`npm info ${dependantsChain[0]} --json`)
  .then(JSON.parse)
  .then(info=>{
    const semver=info.dependencies[targetPackage] || info.devDependencies[targetPackage]
    if(dependantsChain.length <= 1) {
      return 'ran out of parents to go up, this looks fixed'
    }
    if(matchSemverToVersion(semver, targetVersion)){
      //semver range includes the fix, go up
      const newTarget = dependantsChain.shift()
      //This is a bit strict, maybe we wouldn't have to force an update to latest on everything in the chain, but it'd require iterating over all versions between what's used by dependant and latest
      const newTargetVersion = info['dist-tags'].latest
      return findFeasibleUpdate(newTarget, newTargetVersion, dependantsChain)
    } else {
      return `update ${targetPackage} in ${dependantsChain[0]} to ${targetVersion}`
    }
  })
}

module.exports = {
    findFeasibleUpdate
}
