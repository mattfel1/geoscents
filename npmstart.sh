#!/bin/bash

touch /root/npm_log
rm /root/npm_log
cd /var/www/html
pm2 start --no-daemon 2>&1 | tee /root/npm_log
