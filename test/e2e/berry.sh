function clean_yarn () {
  rm -rf .yarn
  rm yarn.lock
  rm .yarnrc.yml
}

yarn set version berry
echo "nodeLinker: node-modules" >> .yarnrc.yml
yarn

echo 'runs resolve on yarn berry'
echo q | node resolve.js --yarn-berry > /dev/null 

EXITCODE=$?
if [ $EXITCODE -ne 0 ]; then
  echo "FAILED, expected exit code 0, got $EXITCODE"
  clean_yarn
  exit 1
fi

echo 'runs check on yarn berry with extra args'
node check.js --yarn-berry --all --recursive

EXITCODE=$?
if [ $EXITCODE -ne 0 ]; then
  echo "FAILED, expected exit code 0, got $EXITCODE"
  clean_yarn
  exit 1
fi

clean_yarn

echo '- Runs ----------------------- OK'

