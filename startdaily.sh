#!/bin/bash

pkill -f npm
pkill -f node
bash /root/update.sh
bash /root/npmstart.sh &
cp /home/mattfel/visualization/* /var/www/html/visualization/

