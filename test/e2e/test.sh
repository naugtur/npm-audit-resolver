#!/bin/sh

echo 'run check on clean audit 6'
node check.js --mock=test/e2e/6cleanAudit.json --json > /dev/null

if [ $? -gt 0 ]; then
  echo 'FAILED'
  exit 1
fi

echo 'run check on clean audit 7'
node check.js --mock=test/e2e/7cleanAudit.json --json > /dev/null

if [ $? -gt 0 ]; then
  echo 'FAILED'
  exit 1
fi

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

echo 'run check and get it to exit 1 for vulns found 6'
node check.js --mock=test/e2e/6bigAudit.json --json > /dev/null

EXITCODE=$?
if [ $EXITCODE -ne 1 ]; then
  echo "FAILED, expected exit code 1, got $EXITCODE"
  exit 1
fi

echo 'run check and get it to exit 1 for vulns found 7'
node check.js --mock=test/e2e/7bigAudit.json --json > /dev/null

EXITCODE=$?
if [ $EXITCODE -ne 1 ]; then
  echo "FAILED, expected exit code 1, got $EXITCODE"
  exit 1
fi

echo 'run check and get it to exit 1 for vulns found yarn'
node check.js --yarn --mock=test/e2e/ybigAudit.json --json > /dev/null

EXITCODE=$?
if [ $EXITCODE -ne 1 ]; then
  echo "FAILED, expected exit code 1, got $EXITCODE"
  exit 1
fi

echo 'run check on a broken audit 6'
node check.js --mock=test/e2e/6noAudit.json --json >/dev/null 2>&1

EXITCODE=$?
if [ $EXITCODE -ne 2 ]; then
  echo "FAILED, expected exit code 2, got $EXITCODE"
  exit 1
fi

echo 'run check on a broken audit 7'
node check.js --mock=test/e2e/7noAudit.json --json >/dev/null 2>&1

EXITCODE=$?
if [ $EXITCODE -ne 2 ]; then
  echo "FAILED, expected exit code 2, got $EXITCODE"
  exit 1
fi

echo 'long output pipes correctly'
RESULT=`node check.js --mock=test/e2e/6bigAudit.json --json | wc -l`
if [ $RESULT -ne 512 ]; then
  echo "piped output truncated. expected 512 got $RESULT"
  echo 'FAILED'
  exit 1
fi


echo '- Mocks ----------------------- OK'


echo 'runs check on npm'
node check.js > /dev/null 

EXITCODE=$?
if [ $EXITCODE -ne 0 ]; then
  echo "FAILED, expected exit code 0, got $EXITCODE"
  exit 1
fi

echo 'runs check on yarn'
node check.js --yarn > /dev/null 

EXITCODE=$?
if [ $EXITCODE -ne 0 ]; then
  echo "FAILED, expected exit code 0, got $EXITCODE"
  exit 1
fi


echo 'runs resolve on npm'
echo q | node resolve.js > /dev/null 

EXITCODE=$?
if [ $EXITCODE -ne 0 ]; then
  echo "FAILED, expected exit code 0, got $EXITCODE"
  exit 1
fi

echo 'runs resolve on yarn'
echo q | node resolve.js --yarn > /dev/null 

EXITCODE=$?
if [ $EXITCODE -ne 0 ]; then
  echo "FAILED, expected exit code 0, got $EXITCODE"
  exit 1
fi


echo 'runs check on npm with extra args'
RESULT1=`node check.js --production --XbookmarkX --migrate | grep XbookmarkX | wc -l`  
RESULT2=`node check.js --production --XbookmarkX --migrate | grep XbookmarkX | grep migrate | wc -l` 

if [ $RESULT1 -ne 1 ] || [ $RESULT2 -ne 0 ]; then
  echo "FAILED, expected passing arguments down to work, expected filtering out arguments to work"
  exit 1
fi

echo 'runs check on yarn with extra args'
RESULT1=`node check.js --yarn --production --XbookmarkX --migrate | grep XbookmarkX | wc -l`  
RESULT2=`node check.js --yarn --production --XbookmarkX --migrate | grep XbookmarkX | grep migrate | wc -l` 

if [ $RESULT1 -ne 1 ] || [ $RESULT2 -ne 0 ]; then
  echo "FAILED, expected passing arguments down to work, expected filtering out arguments to work"
  exit 1
fi
echo '- Runs ----------------------- OK'
