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
            mustRemove = entry['country'] in blacklist or (blacklist == ['*'] and entry['country'] not in whitelist)
            mustKeep = entry['country'] in whitelist or entry['admin_name'] in whitelist or entry['city_ascii'] in whitelist
            # Still respect population if this is a single-country scrape
            if (blacklist == ['*']):
                mustKeep = mustKeep and (thisPop >= pop or thisCap)

            inLat = entry['lat'] < latrng[1] and entry['lat'] > latrng[0]
            inLon = (entry['lng'] < lonrng[1] and entry['lng'] > lonrng[0]) or ((entry['lng'] + 360) < lonrng[1] and (entry['lng'] + 360) > lonrng[0])
            if (mustKeep or (not mustRemove and inLat and inLon and (thisPop >= pop or thisCap))):
                filtered.append(entry)
                if (entry['country'] not in countries):
                    countries.append(entry['country'])
        print('\n%d entries' % len(filtered))
        print('%d countries' % len(countries))
        print(countries)

        string_data = json.dumps(filtered, indent=2)
        with open(outfile, 'w') as data_file:
            data_file.write("module.exports = { CITIES: ")
            data_file.write(string_data)
            data_file.write("}")


outfile = 'worldcities.js'
lonrng = [-180, 180]
latrng = [-65, 77]
pop = 580000
blacklist = []
whitelist = ['Jersey', 'Turks And Caicos Islands', 'Isle of Man', 'Falkland Islands (Islas Malvinas)', 'Bermuda', 'Cook Islands', 'French Polynesia', 'Macau', 'Gibraltar', 'New Caledonia', 'Azores']
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, True)

outfile = 'worldeasycities.js'
lonrng = [-180, 180]
latrng = [-65, 77]
pop = 9999999999999 # capital cities only
blacklist = []
whitelist = ['Jersey', 'Turks And Caicos Islands', 'Isle of Man', 'Falkland Islands (Islas Malvinas)', 'Bermuda', 'Cook Islands', 'French Polynesia', 'Macau', 'Gibraltar']
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, False)

outfile = 'uscities.js'
lonrng = [-141, -43]
latrng = [12,54]
pop = 100000
blacklist = ['Barbados', 'Curaçao', 'Aruba', 'Saint Vincent And The Grenadines', 'Saint Lucia', 'Antigua And Barbuda', 'Grenada', 'Dominica', 'Saint Kitts And Nevis', 'Sint Maarten', 'Martinique', 'Guadeloupe']
whitelist = []
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, True)

outfile = 'oceaniacities.js'
lonrng = [92,252]
latrng = [-51,28]
pop = 10000
blacklist =  ['Macau', 'Thailand', 'Mexico', 'United States', 'Sri Lanka', 'India', 'China', 'Philippines', 'Vietnam', 'Cambodia', 'Laos', 'Hong Kong', 'Taiwan', 'Bangladesh', 'Burma', 'Nepal', 'Bhutan', 'Japan']
whitelist = ['Cook Islands', 'Wallis And Futuna', 'Honolulu', 'Hilo', 'Wailuku', 'Lihue', 'Easter Island', 'Tokelau']
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, True)

outfile = 'asiacities.js'
lonrng = [27,156]
latrng = [2,59]
pop = 400000
blacklist = ['Egypt', 'Ethiopia', 'Ukraine', 'Djibouti', 'Moldova', 'Eritrea', 'Cyprus', 'South Sudan', 'Northern Mariana Islands', 'Guam', 'Macau', 'Sudan', 'Belarus', 'Somalia']
whitelist = []
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, True)

outfile = 'samericacities.js'
lonrng = [-138, -30]
latrng = [-54,20]
pop = 61000
blacklist = ['Mexico', 'Haiti', 'El Salvador', 'Costa Rica', 'Panama', 'Guatemala', 'Honduras', 'Jamaica', 'Nicaragua',  'Belize', 'Martinique', 'Guadeloupe', 'Pitcairn Islands']
whitelist = ['Falkland Islands (Islas Malvinas)', 'Galápagos', 'South Georgia And South Sandwich Islands', 'Easter Island']
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, True)

outfile = 'eurocities.js'
lonrng = [-36, 52]
latrng = [37,66]
pop = 100000
blacklist = ['Azerbaijan', 'Iran', 'Armenia', 'Georgia', 'Kazakhstan', 'Iraq', 'Syria', 'Tunisia']
whitelist = ['Isle Of Man', 'Gibraltar', 'Shetland Islands', 'Torshavn', 'Azores', 'Jersey']
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, True)

outfile = 'africacities.js'
lonrng = [-58, 80]
latrng = [-34,39]
pop = 100000
blacklist = ['India', 'Brazil', 'Pakistan', 'Iran', 'Iraq', 'Saudi Arabia', 'Afghanistan', 'Greece', 'Israel', 'Portugal', 'Syria', 'Turkey', 'Kuwait', 'Yemen', 'Paraguay', 'Lebanon', 'Qatar', 'United Arab Emirates', 'Spain', 'Tajikistan', 'Jordan', 'Oman', 'Turkmenistan', 'Bahrain', 'Malta', 'Suriname', 'Cyprus', 'Sri Lanka', 'Maldives', 'West Bank', 'Italy', 'Uzbekistan', 'China', 'Argentina', 'Uruguay']
whitelist = ['Gibraltar']
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, True)

outfile = 'ukrainecities.js'
lonrng = [17.7, 45]
latrng = [43.2, 54]
pop = 0
blacklist = ['Moldova', 'Belarus', 'Russia', 'Poland', 'Romania', 'Hungary', 'Serbia', 'Bosnia And Herzegovina', 'Czechia', 'Bulgaria', 'Slovakia', 'Gibraltar', 'Croatia', 'Montenegro']
whitelist = []
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, True)

outfile = 'argentinacities.js'
lonrng = [-102, -20]
latrng = [-56.5, -20]
pop = 30000
blacklist = ['*']
whitelist = ['Argentina']
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, True)

outfile = 'australiacities.js'
lonrng = [97, 170]
latrng = [-45.5, -8]
pop = 15000
blacklist = ['*']
whitelist = ['Australia']
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, True)

outfile = 'canadacities.js'
lonrng = [-160, -15]
latrng = [38, 77.5]
pop = 15000
blacklist = ['*']
whitelist = ['Canada']
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, True)

outfile = 'japancities.js'
lonrng = [110, 164.5]
latrng = [23.5, 49]
pop = 0
blacklist = ['*']
whitelist = ['Japan']
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, True)

outfile = 'kenyacities.js'
lonrng = [30, 49]
latrng = [5.9, -5.3]
pop = 0
blacklist = ['*']
whitelist = ['Kenya']
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, True)

outfile = 'romaniacities.js'
lonrng = [19, 33.7]
latrng = [49, 43]
pop = 0
blacklist = ['*']
whitelist = ['Romania']
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, True)

outfile = 'perucities.js'
lonrng = [-92, -55]
latrng = [-19.5, 2]
pop = 20000
blacklist = ['*']
whitelist = ['Peru']
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, True)

outfile = 'egyptcities.js'
lonrng = [16.5, 41.7]
latrng = [34, 20.81]
pop = 0
blacklist = ['*']
whitelist = ['Egypt']
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, True)

outfile = 'indonesiacities.js'
lonrng = [84.5, 151]
latrng = [15, -23.5]
pop = 90000
blacklist = ['*']
whitelist = ['Indonesia']
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, True)

outfile = 'spaincities.js'
lonrng = [-14.18, 8]
latrng = [35, 45]
pop = 0
blacklist = ['*']
whitelist = ['Spain']
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, True)
