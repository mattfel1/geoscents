#!/bin/bash -i

. /root/.bashrc

ip=`tail -1 /scratch/feedback.log | sed "s/.*Message passed by ::ffff://g" | sed "s/ .*//g"`
name=`tail -1 /scratch/feedback.log | sed "s/.*$ip //g" | sed "s/:.*//g"`
echo "GeoScents Alert! $name" > /scratch/email.txt
echo "" >> /scratch/email.txt
tail -1 /scratch/feedback.log >> /scratch/email.txt
echo "" >> /scratch/email.txt
wget -O lookup ip-api.com/json/$ip
cat lookup >> /scratch/email.txt

# smpt doesn't work with any of the major services anymore..
#cat /scratch/email.txt | sendmail mattfel@protonmail.com

# Use pushover app:
push "`cat /scratch/email.txt`"
