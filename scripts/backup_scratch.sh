#!/bin/bash

# Register this with crontab 0 1 * * * bash ~/geoscents/resources/backup_scratch.sh
backup_dir='/home/mattfel/geoscents_backups/'
max_backup=20
rm -rf ${backup_dir}/scratch${max_backup}

for (( c=$((max_backup-1)); c>=0; c-- ))
do
	next=$((c+1))
	mv ${backup_dir}/scratch${c} ${backup_dir}/scratch${next}
done

mkdir ${backup_dir}/scratch0
scp -r root@geoscents.net:/scratch/* ${backup_dir}/scratch0/
touch ${backup_dir}/scratch0/"$(date)"
