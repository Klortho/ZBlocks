#!/bin/bash
# Kill the servers started by run-server.sh

PID=`pgrep -f 'http-server.*-p 8755'`
if [ "$PID" != "" ]; then
  kill -9 $PID
fi

PID=`pgrep -f 'http-server.*-p 8756'`
if [ "$PID" != "" ]; then
  kill -9 $PID
fi

