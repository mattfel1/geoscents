#!/bin/bash

ip=`tail -1 /scratch/feedback.log | sed "s/.*Message passed by ::ffff://g" | sed "s/ .*//g"`
name=`tail -1 /scratch/feedback.log | sed "s/.*$ip //g" | sed "s/:.*//g"`
echo "Subject: GeoScents Feedback from $name" > /scratch/email.txt
echo "" >> /scratch/email.txt
tail -1 /scratch/feedback.log >> /scratch/email.txt
echo "" >> /scratch/email.txt
wget -O lookup ip-api.com/json/$ip
cat lookup >> /scratch/email.txt

cat /scratch/email.txt | sendmail mattfel@protonmail.com

