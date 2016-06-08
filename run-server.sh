#!/bin/bash
# Run the server setup for ZBlocks
# A fork of https://github.com/jmoenig/Snap--Build-Your-Own-Blocks is expected
# to be cloned to, or soft-linked from, the `snap` subdirectory here

(
  cd snap && nohup http-server -p 8755 > snap-server.log 2>&1&
)

# The main server proxies anything it can't resolve to the snap! server
nohup http-server --proxy http://localhost:8755 \
  -p 8756 -d false -i false \
  > zblocks-server.log 2>&1&

echo 'Server should be running at http://localhost:8756'
echo 'See log files in zblocks-server.log (main server) and snap-server.log (proxy)'
echo 'Use ./kill-server.sh to kill it.'
