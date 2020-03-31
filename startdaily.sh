#!/bin/bash

pkill -f npm
pkill -f node
bash /root/update.sh
# cp /home/mattfel/visualization/*.js /var/www/html/visualization/
# cp /home/mattfel/visualization/*.css /var/www/html/visualization/
# cp /home/mattfel/visualization/*.html /var/www/html/visualization/
# cp /home/mattfel/visualization/*.jpg /var/www/html/visualization/
# cp /home/mattfel/visualization/*.gif /var/www/html/visualization/

bash /root/npmstart.sh 
