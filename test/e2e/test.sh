#!/bin/sh

echo 'run check on clean audit'
node check.js --mock=test/e2e/emptyAudit.json --json > /dev/null

if [ $? -gt 0 ]; then
  echo 'FAILED'
  exit 1
fi

echo 'run check and get it to exit 1 for vulns found'
node check.js --mock=test/e2e/bigAudit.json --json > /dev/null

EXITCODE=$?
if [ $EXITCODE -ne 1 ]; then
  echo "FAILED, expected exit code 1, got $EXITCODE"
  exit 1
fi

echo 'run check on a broken audit'
node check.js --mock=test/e2e/brokenAudit.json --json >/dev/null 2>&1

EXITCODE=$?
if [ $EXITCODE -ne 2 ]; then
  echo "FAILED, expected exit code 2, got $EXITCODE"
  exit 1
fi

echo 'long output pipes correctly'
RESULT=`node check.js --mock=test/e2e/bigAudit.json --json | wc -l`
if [ $RESULT -ne 4799 ]; then
  echo "piped output truncated. expected 4799 got $RESULT"
  echo 'FAILED'
  exit 1
fi


echo 'OK'