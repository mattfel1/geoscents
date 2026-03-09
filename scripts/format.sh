#!/bin/bash

for X in /home/mattfel/geoscents/client/*.js; do    js-beautify $X -r ; done
for X in /home/mattfel/geoscents/server/*.js; do    js-beautify $X -r ; done
for X in /home/mattfel/geoscents/resources/*.js; do    js-beautify $X -r ; done
for X in /home/mattfel/geoscents/resources/*.json; do    js-beautify $X -r ; done
for X in /home/mattfel/geoscents/resources/databases/*.js; do    js-beautify $X -r ; done
for X in /home/mattfel/geoscents/resources/*.html; do    js-beautify $X -r ; done
for X in /home/mattfel/geoscents/*.html; do    js-beautify $X -r ; done
for X in /home/mattfel/geoscents/*.css; do    js-beautify $X -r ; done
if grep -q '\\"' /home/mattfel/geoscents/resources/databases/*; then
	grep -r '\\"' /home/mattfel/geoscents/resources/databases
    echo "ERROR: Found quotation in entry. This will break the data scraper!  Please change it to use single quotes, ''"
fi
