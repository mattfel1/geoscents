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
            if (inLat and inLon and (mustKeep or (not mustRemove and (thisPop >= pop or thisCap)))): 
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

outfile = 'namericacities.js'
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

outfile = 'europecities.js'
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
latrng = [-5.3, 5.9]
pop = 0
blacklist = ['*']
whitelist = ['Kenya']
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, True)

outfile = 'romaniacities.js'
lonrng = [19, 33.7]
latrng = [43, 49]
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
latrng = [20.81, 34]
pop = 0
blacklist = ['*']
whitelist = ['Egypt']
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, True)

outfile = 'indonesiacities.js'
lonrng = [84.5, 151]
latrng = [-23.5, 15]
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

outfile = 'chinacities.js'
lonrng = [62, 148]
latrng = [16.85, 56]
pop = 500000
blacklist = ['*']
whitelist = ['China']
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, True)

outfile = 'unitedstatescities.js'
lonrng = [-130, -60]
latrng = [22, 53.7]
pop = 200000
blacklist = ['*']
whitelist = ['United States']
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, True)

outfile = 'irancities.js'
lonrng = [36, 72.6]
latrng = [24, 42]
pop = 0
blacklist = ['*']
whitelist = ['Iran']
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, True)

outfile = 'brazilcities.js'
lonrng = [-91.7, -17]
latrng = [-34, 8]
pop = 80000
blacklist = ['*']
whitelist = ['Brazil']
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, True)

outfile = 'mexicocities.js'
lonrng = [-120, -80]
latrng = [13.61, 35]
pop = 0
blacklist = ['*']
whitelist = ['Mexico']
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, True)

outfile = 'indiacities.js'
lonrng = [50, 107.3]
latrng = [6, 37]
pop = 0
blacklist = ['*']
whitelist = ['India']
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, True)

outfile = 'italycities.js'
lonrng = [-2.1, 25.4]
latrng = [36, 48]
pop = 0
blacklist = ['*']
whitelist = ['Italy']
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, True)

outfile = 'unitedkingdomcities.js'
lonrng = [-19.55, 15]
latrng = [49.5, 61]
pop = 1000
blacklist = ['*']
whitelist = ['United Kingdom']
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, True)

outfile = 'germanycities.js'
lonrng = [-2.1, 23]
latrng = [46.8, 56]
pop = 0
blacklist = ['*']
whitelist = ['Germany']
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, True)

outfile = 'francecities.js'
lonrng = [-10.2, 17]
latrng = [41, 52]
pop = 0
blacklist = ['*']
whitelist = ['France']
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, True)

outfile = 'nigeriacities.js'
lonrng = [-2.48, 19]
latrng = [3.5, 16]
pop = 0
blacklist = ['*']
whitelist = ['Nigeria']
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, True)

outfile = 'southafricacities.js'
lonrng = [9, 37]
latrng = [-35.51, -21]
pop = 0
blacklist = ['*']
whitelist = ['South Africa']
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, True)

outfile = 'democraticrepublicofthecongocities.js'
lonrng = [3.53, 41]
latrng = [-14, 8]
pop = 0
blacklist = ['*']
whitelist = ['Congo (Kinshasa)']
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, True)

outfile = 'moroccocities.js'
lonrng = [-25, 10]
latrng = [20.03, 38]
pop = 0
blacklist = ['*']
whitelist = ['Morocco']
scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, True)