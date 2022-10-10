#!/bin/bash

for X in ../client/*.js; do    js-beautify $X -r ; done
for X in ../server/*.js; do    js-beautify $X -r ; done
for X in ../resources/*.js; do    js-beautify $X -r ; done
for X in ../resources/*.json; do    js-beautify $X -r ; done
for X in ../resources/databases/*.js; do    js-beautify $X -r ; done
for X in ../resources/*.html; do    js-beautify $X -r ; done
for X in ../*.html; do    js-beautify $X -r ; done
for X in ../*.css; do    js-beautify $X -r ; done
if grep -q '\\"' ../resources/databases/*; then
	grep -r '\\"' ../resources/databases
    echo "ERROR: Found quotation in entry. This will break the data scraper!  Please change it to use single quotes, ''"
fi
