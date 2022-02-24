import os
import ipinfo
import json
from pathlib import Path
import urllib.request
import re

def scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, include_admin):
    countries = []
    file = 'cities.js'
    with open(file) as json_file:
        data = json.load(json_file)
        filtered = []
        for entry in data:
            thisPop = 0 if (entry['population'] == '') else int(entry['population'])
            thisMinorCap = (entry['iso2'] == 'US' or entry['iso2'] == 'CN' or entry['iso2'] == 'CA' or entry['iso2'] == 'AU' or entry['iso2'] == 'IN') and  entry['capital'] == 'admin'
            thisCap = (include_admin and thisMinorCap) or entry['capital'] == 'primary'
            mustRemove = entry['country'] in blacklist
            mustKeep = entry['country'] in whitelist or entry['admin_name'] in whitelist or entry['city_ascii'] in whitelist
            inLat = entry['lat'] < latrng[1] and entry['lat'] > latrng[0]
            inLon = (entry['lng'] < lonrng[1] and entry['lng'] > lonrng[0]) or ((entry['lng'] + 360) < lonrng[1] and (entry['lng'] + 360) > lonrng[0])
            if (mustKeep or (not mustRemove and inLat and inLon and (thisPop >= pop or thisCap))):
                filtered.append(entry)
                if (entry['country'] not in countries):
                    countries.append(entry['country'])
        print('%d entries' % len(filtered))
        print('%d countries' % len(countries))
        print(countries)

        string_data = json.dumps(filtered, indent=2)
        with open(outfile, 'w') as data_file:
            data_file.write("module.exports = { CITIES: ")
            data_file.write(string_data)
            data_file.write("}")


outfile = 'worldcities.js'
latrng = [-65, 77]
pop = 580000
lonrng = [-180, 180]
blacklist = []
whitelist = ['Jersey', 'Turks And Caicos Islands', 'Isle of Man', 'Falkland Islands (Islas Malvinas)', 'Bermuda', 'Cook Islands', 'French Polynesia', 'Macau', 'Gibraltar', 'New Caledonia', 'Azores']
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, True)

outfile = 'worldeasycities.js'
latrng = [-65, 77]
pop = 9999999999999 # capital cities only
lonrng = [-180, 180]
blacklist = []
whitelist = ['Jersey', 'Turks And Caicos Islands', 'Isle of Man', 'Falkland Islands (Islas Malvinas)', 'Bermuda', 'Cook Islands', 'French Polynesia', 'Macau', 'Gibraltar', 'New Caledonia']
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, False)

outfile = 'uscities.js'
latrng = [12,54]
pop = 100000
lonrng = [-141, -43]
blacklist = ['Barbados', 'Curaçao', 'Aruba', 'Saint Vincent And The Grenadines', 'Saint Lucia', 'Antigua And Barbuda', 'Grenada', 'Dominica', 'Saint Kitts And Nevis', 'Sint Maarten', 'Martinique', 'Guadeloupe']
whitelist = []
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, True)

outfile = 'oceaniacities.js'
latrng = [-51,28]
pop = 10000
lonrng = [92,252]
blacklist =  ['Macau', 'Thailand', 'Mexico', 'United States', 'Sri Lanka', 'India', 'China', 'Philippines', 'Vietnam', 'Cambodia', 'Laos', 'Hong Kong', 'Taiwan', 'Bangladesh', 'Burma', 'Nepal', 'Bhutan', 'Japan']
whitelist = ['Cook Islands', 'Wallis And Futuna', 'Honolulu', 'Hilo', 'Wailuku', 'Lihue', 'Easter Island', 'Tokelau']
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, True)

outfile = 'asiacities.js'
latrng = [2,59]
pop = 400000
lonrng = [27,156]
blacklist = ['Egypt', 'Ethiopia', 'Ukraine', 'Djibouti', 'Moldova', 'Eritrea', 'Cyprus', 'South Sudan', 'Northern Mariana Islands', 'Guam', 'Macau', 'Sudan', 'Belarus', 'Somalia']
whitelist = []
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, True)

outfile = 'samericacities.js'
latrng = [-54,20]
pop = 61000
lonrng = [-138, -30]
blacklist = ['Mexico', 'Haiti', 'El Salvador', 'Costa Rica', 'Panama', 'Guatemala', 'Honduras', 'Jamaica', 'Nicaragua',  'Belize', 'Martinique', 'Guadeloupe', 'Pitcairn Islands']
whitelist = ['Falkland Islands (Islas Malvinas)', 'Galápagos', 'South Georgia And South Sandwich Islands', 'Easter Island']
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, True)

outfile = 'eurocities.js'
latrng = [37,66]
pop = 100000
lonrng = [-36, 52]
blacklist = ['Azerbaijan', 'Iran', 'Armenia', 'Georgia', 'Kazakhstan', 'Iraq', 'Syria', 'Tunisia']
whitelist = ['Isle Of Man', 'Gibraltar', 'Shetland Islands', 'Torshavn', 'Azores', 'Jersey']
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, True)

outfile = 'africacities.js'
latrng = [-34,39]
pop = 100000
lonrng = [-58, 80]
blacklist = ['India', 'Brazil', 'Pakistan', 'Iran', 'Iraq', 'Saudi Arabia', 'Afghanistan', 'Greece', 'Israel', 'Portugal', 'Syria', 'Turkey', 'Kuwait', 'Yemen', 'Paraguay', 'Lebanon', 'Qatar', 'United Arab Emirates', 'Spain', 'Tajikistan', 'Jordan', 'Oman', 'Turkmenistan', 'Bahrain', 'Malta', 'Suriname', 'Cyprus', 'Sri Lanka', 'Maldives', 'West Bank', 'Italy', 'Uzbekistan', 'China', 'Argentina', 'Uruguay']
whitelist = ['Gibraltar']
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, True)

outfile = 'ukrainecities.js'
latrng = [43.2, 54]
pop = 0
lonrng = [17.7, 45]
blacklist = ['Moldova', 'Belarus', 'Russia', 'Poland', 'Romania', 'Hungary', 'Serbia', 'Bosnia And Herzegovina', 'Czechia', 'Bulgaria', 'Slovakia', 'Gibraltar', 'Croatia', 'Montenegro']
whitelist = []
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, True)

