# Introduction
This is an unabashed attempt to recreate the game GeoSense (geosense.net), which went offline some time after ~2012.
I have seen a few discussions on Reddit and elsewhere about people asking if it will ever go back online, but no one 
seems to have made an effort to bring it back.

I am a complete novice at Javascript and node.js but I made an attempt to throw this together anyway.

Feel free to contribute!

# Getting Started

This is a simple starting point for a HTML5 game using Canvas, Sockets.io and Express.

You can use pm2, which will restart when there is a crash.  Make sure package.json script entry says: `"start": "webpack -w & pm2 start server/app.js --ignore public"`

```
npm update
webpack
pm2 start # --no-daemon #(for interactive)
```

Or you can use nodemon, which will restart when you update a js file.  Make sure package.json script entry says: `"start": "webpack -w & nodemon  server/app.js --ignore public"`

```
npm update
webpack
npm start
```


# Formatting

```
npm -g install js-beautify
bash scripts/format.sh # calls beautify on all files js-beautify <file> -r
```