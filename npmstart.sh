#!/bin/bash

touch /root/npm_log
rm /root/npm_log
cd /var/www/html
npm start 2>&1 | tee /root/npm_log
