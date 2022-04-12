#!/bin/bash

for X in client/*.js; do    js-beautify $X -r ; done
for X in server/*.js; do    js-beautify $X -r ; done
for X in resources/*.js; do    js-beautify $X -r ; done
for X in resources/*.html; do    js-beautify $X -r ; done
for X in ./*.html; do    js-beautify $X -r ; done
for X in ./*.css; do    js-beautify $X -r ; done

