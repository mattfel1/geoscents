#!/bin/bash

# This script shifts old copies of geoscents data through ~/geoscents_backups/scratch* to give me 20 days worth of snapshots
backupdir='/home/mattfel/geoscents_backups'
for i in {18..0..-1}
do
   ii=$((i+1))
   echo "scratch$i -> scratch$ii"
   mv $backupdir/scratch$i/* $backupdir/scratch$ii
done

cp /scratch/* $backupdir/scratch0/
