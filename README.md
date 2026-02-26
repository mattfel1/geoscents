# GeoScents

[![Tests](https://github.com/mattfel1/geoscents/actions/workflows/test.yml/badge.svg)](https://github.com/mattfel1/geoscents/actions/workflows/test.yml)

This is an unabashed attempt to recreate the game GeoSense (geosense.net), which went offline some time after ~2012.
I have seen a few discussions on Reddit and elsewhere about people asking if it will ever go back online, but no one 
seems to have made an effort to bring it back.

I am a complete novice at Javascript and node.js but I made an attempt to throw this together anyway.

Feel free to contribute!

# Getting Started

## Local development (WSL / Linux)

```bash
npm install
npm start        # serves at http://localhost:5000
```

`npm start` bundles the client with webpack (watch mode) and starts the server with nodemon.
It sets `LOCAL_DEV=1` automatically, which switches the server to plain HTTP on port 5000 — no SSL certs needed.
It also kills any stale webpack process from a previous run before starting a new one.

## Production (Digital Ocean / PM2)

SSH into the server and run in tmux:

```bash
cd /root/geoscents
git pull
bash scripts/deploy.sh
```

`deploy.sh` kills existing processes, copies files to `/var/www/html`, runs `npm install`,
builds the bundle in production mode, and starts the app under PM2.


# Adding New Maps

All coordinates use the format `[min_lon, max_lon, min_lat, max_lat]`.
The display name in `maps.json` is what matters for capitalisation — all other filenames are derived from it as lowercase with spaces and dots removed (e.g. `"British Isles"` → `britishisles`).

Maps come in three tiers: **continent**, **region**, and **country**.

---

## Step 1 — Generate map images (`scripts/ImageGenerators.ipynb`)

Add a new cell near similar maps with:

```python
coords = [-18.55, 10.5, 49.5, 59.4]   # [min_lon, max_lon, min_lat, max_lat]
name   = "britishisles"                # lowercase, no spaces or dots
ok = classic(coords, name)
if ok:
    terrain(coords, name)
    satellite(coords, name)
```

`classic()` returns `False` if the bounding box fails the aspect-ratio check built into the game canvas.
Adjust `coords` (usually just nudge the edges) until it passes, then run `terrain` and `satellite` too.

---

## Step 2 — Build the city database (`scripts/frame.py`)

Add one line near similar maps. The function to use depends on the tier:

**Region** (whitelist = countries that must appear; everything outside the whitelist is excluded):
```python
make_region_list("britishisles", [-18.55, 10.5, 49.5, 59.4], 50,
                 ["United Kingdom", "Ireland", "Isle of Man"], errors)
#                 filename          coords                       min_pop  whitelist
```

**Country** (single-country scrape; whitelist is set automatically):
```python
make_country_list("New Zealand", [-180, 180, -50, -33], 1000, errors)
#                  display name   coords                  min_pop
```

**Continent** (can have both a blacklist *and* a whitelist; both are plain Python lists):
```python
outfile   = geoscents_home + 'resources/databases/mycontinent.js'
rng       = [min_lon, max_lon, min_lat, max_lat]
pop       = 200000
blacklist = ["Country to always exclude"]          # [] means no exclusions
whitelist = ["Small territory to always include"]  # [] means no forced inclusions
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True, False, errors)
```

A city is included when it is:
1. Inside the coordinate bounds, **and**
2. Not in the blacklist (for continents), or country is in the whitelist (for regions/countries), **and**
3. Meets the minimum population threshold **or** is a national/state capital.

Cities or admin regions explicitly listed in the whitelist bypass the population filter.

---

## Step 3 — Register the map (`resources/maps.json`)

Add an entry in alphabetical order. The key is the display name (capitalisation is what players see):

```json
"British Isles": {
    "leader":   "Britannia",
    "greeting": "Welcome",
    "coords": [-18.55, 10.5, 49.5, 59.4],
    "flair":  "🇬🇧",
    "tier":   "region"
}
```

Fields:
- `coords` — game viewport bounds (can differ slightly from the image/frame coords if needed)
- `flair` — flag emoji shown next to the map name
- `tier` — `"continent"`, `"region"`, or `"country"`
- `leader` / `greeting` — optional; display name and local-language greeting for the welcome banner

Continents omit `leader` and `greeting`. Countries and regions usually include them.

---

## Step 4 — Rebuild the search index

```bash
node scripts/build-country-index.js
```

This updates `resources/map-countries.json`, which powers the "search by country name" autocomplete.
The CI test (`npm test`) will fail if you skip this step after adding a map.

---

# Formatting

```
npm -g install js-beautify
bash scripts/format.sh # calls beautify on all files js-beautify <file> -r
```
