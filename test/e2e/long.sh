#!/bin/sh
RESULT=`node check.js --mock=test/e2e/bigAudit.json --json | wc -l`
if [ $RESULT -ne 4799 ]; then
  echo "piped output truncated. expected 4799 got $RESULT"
  exit 1
fi
