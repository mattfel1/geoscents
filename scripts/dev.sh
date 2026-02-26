#!/bin/bash
# Kill any leftover webpack watcher from a previous run
pkill -f webpack-cli 2>/dev/null || true

# Start webpack in watch mode in the background, then nodemon in the foreground.
# When you Ctrl+C nodemon, the trap cleans up webpack.
cleanup() {
    kill $WEBPACK_PID 2>/dev/null || true
}
trap cleanup EXIT

LOCAL_DEV=1 webpack -w &
WEBPACK_PID=$!
LOCAL_DEV=1 nodemon server/app.js --ignore public --ignore resources/histories --ignore resources/famers
