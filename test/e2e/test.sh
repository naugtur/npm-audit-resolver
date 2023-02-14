#!/bin/sh

echo '+++++++++++++++++++++++++++++++++++++++'
echo '+  Integration tests (test.sh)        +'
echo '+++++++++++++++++++++++++++++++++++++++'

echo 'regenerate lockfile compatible with current node and npm'
rm -f ./package-lock.json
npm install --package-lock-only

echo 'migrates from old format to new'
rm ./audit-resolve.json 2>/dev/null
cp test/e2e/deprecatedResolvFormat.json ./audit-resolv.json
node check.js --mock=test/e2e/7cleanAudit.json --json > /dev/null
EXITCODE=$?
rm ./audit-resolv.json

if [ $EXITCODE -gt 0 ]; then
  echo 'FAILED'
  exit 1
fi


echo 'long output pipes correctly'
RESULT=`node check.js --mock=test/e2e/hugeAudit.json --json | wc -l`
if [ $RESULT -ne 1235 ]; then
  echo "piped output truncated. expected 1235 got $RESULT"
  echo 'FAILED'
  exit 1
fi


echo 'warns about running resolve in CI'
export CI=true
echo q | node resolve.js > /dev/null 

EXITCODE=$?
if [ $EXITCODE -ne 1 ]; then
  echo "FAILED, expected exit code 1, got $EXITCODE"
  exit 1
fi

echo 'runs resolve on npm'
echo q | node resolve.js --trustmeitsnotci  

EXITCODE=$?
if [ $EXITCODE -ne 0 ]; then
  echo "FAILED, expected exit code 0, got $EXITCODE"
  exit 1
fi

echo 'runs resolve on yarn'
echo q | node resolve.js --yarn --trustmeitsnotci 

EXITCODE=$?
if [ $EXITCODE -ne 0 ]; then
  echo "FAILED, expected exit code 0, got $EXITCODE"
  exit 1
fi


echo 'runs check on npm with extra args'
RESULT1=`node check.js --production --XbookmarkX --migrate | grep XbookmarkX | wc -l`  
RESULT2=`node check.js --production --XbookmarkX --migrate | grep XbookmarkX | grep migrate | wc -l` 

if [ $RESULT1 -lt 1 ] || [ $RESULT2 -ne 0 ]; then
  echo "FAILED, expected passing arguments down to work, expected filtering out arguments to work"
  exit 1
fi

echo 'runs check on yarn with extra args'
RESULT1=`node check.js --yarn --production --XbookmarkX --migrate | grep XbookmarkX | wc -l`  
RESULT2=`node check.js --yarn --production --XbookmarkX --migrate | grep XbookmarkX | grep migrate | wc -l` 

if [ $RESULT1 -lt 1 ] || [ $RESULT2 -ne 0 ]; then
  echo "FAILED, expected passing arguments down to work, expected filtering out arguments to work"
  exit 1
fi
echo '+++++++++++++++++++++++++++++++++++++++'
echo '+  test.sh - all passed               +'
echo '+++++++++++++++++++++++++++++++++++++++'