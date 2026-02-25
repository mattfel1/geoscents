# Introduction
This is an unabashed attempt to recreate the game GeoSense (geosense.net), which went offline some time after ~2012.
I have seen a few discussions on Reddit and elsewhere about people asking if it will ever go back online, but no one 
seems to have made an effort to bring it back.

I am a complete novice at Javascript and node.js but I made an attempt to throw this together anyway.

Feel free to contribute!

# Getting Started

## Local development (WSL / Linux)

```bash
npm install
npm start        # serves at http://localhost:5000
```

`npm start` bundles the client with webpack (watch mode) and starts the server with nodemon.
It sets `LOCAL_DEV=1` automatically, which switches the server to plain HTTP on port 5000 — no SSL certs needed.
It also kills any stale webpack process from a previous run before starting a new one.

## Production (Digital Ocean / PM2)

On the server, deploy via the `startdaily.sh` script in tmux:

```bash
bash scripts/startdaily.sh
```

This pulls latest from git, copies files to `/var/www/html`, runs webpack, and starts the app under PM2.


# Formatting

```
npm -g install js-beautify
bash scripts/format.sh # calls beautify on all files js-beautify <file> -r
```