#!/bin/bash
# Uploads /scratch/player_count.csv to Google Sheets via Apps Script web app.
# Clears the sheet and re-uploads everything each run (idempotent).
# Cron example: 0 3 * * * /home/mattfel/geoscents/scripts/upload_counts.sh

APPS_SCRIPT_URL="https://script.google.com/macros/s/AKfycbxWkNS4U3Efu2yk_UbVa8pHjxl4F34ZgFzXAyuyO5aBurLx0ST6HtSuHvr56Zf52g7l5A/exec"
CSV="/scratch/player_count.csv"

if [ ! -f "$CSV" ]; then
    echo "CSV not found: $CSV"
    exit 1
fi

response=$(curl -s -L -X POST "$APPS_SCRIPT_URL" \
    -H "Content-Type: text/plain" \
    --data-binary @"$CSV")

echo "$(date): $response"
