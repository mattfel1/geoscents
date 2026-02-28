#!/bin/bash
# Uploads /scratch/player_count.csv to Google Sheets via Apps Script web app.
# Clears the sheet and re-uploads everything each run (idempotent).
# Cron example: 0 3 * * * /home/mattfel/geoscents/scripts/upload_counts.sh

APPS_SCRIPT_URL="PASTE_YOUR_DEPLOYMENT_URL_HERE"
CSV="/scratch/player_count.csv"

if [ ! -f "$CSV" ]; then
    echo "CSV not found: $CSV"
    exit 1
fi

response=$(curl -s -L -X POST "$APPS_SCRIPT_URL" \
    -H "Content-Type: text/plain" \
    --data-binary @"$CSV")

echo "$(date): $response"
