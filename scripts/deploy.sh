#!/bin/bash
# Full deploy: pull, copy repo to web dir, install, build, start.
set -e

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DEPLOY_DIR="/var/www/html"

echo "==> Pulling latest code"
git -C "$REPO_DIR" pull --ff-only
git -C "$REPO_DIR" log -1 --format="    deploying %h %s"

echo "==> Stopping existing processes"
pkill -f node || true
pkill -f pm2  || true

echo "==> Deploying from $REPO_DIR to $DEPLOY_DIR"
rm -rf "$DEPLOY_DIR"/*
cp -r "$REPO_DIR"/. "$DEPLOY_DIR"/

cd "$DEPLOY_DIR"

echo "==> Installing dependencies"
export PATH=/usr/local/bin:$PATH
npm install --omit=dev

echo "==> Building country index"
node scripts/build-country-index.js

echo "==> Building bundle"
webpack --mode production

echo "==> Starting server"
pm2 start --no-daemon 2>&1 | tee /root/npm_log
