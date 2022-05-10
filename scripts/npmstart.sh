#!/bin/bash
  
#sudo npm install n -g > /root/npm_log
#sudo n stable >> /root/npm_log
export PATH=/usr/local/bin/:$PATH
touch /root/npm_log
rm /root/npm_log
cd /var/www/html
npm update
webpack
pm2 start --no-daemon 2>&1 | tee /root/npm_log

