import os
import ipinfo
import json
from pathlib import Path
import urllib.request
import re


file = 'cities.js'

#outfile = 'uscities.js'
#latrng = [12,54]
#pop = 100000
#lonrng = [-141, -43]
#blacklist = ['Barbados', 'Curaçao', 'Aruba', 'Saint Vincent And The Grenadines', 'Saint Lucia', 'Antigua And Barbuda', 'Grenada', 'Dominica', 'Saint Kitts And Nevis', 'Sint Maarten', 'Martinique', 'Guadeloupe']
#whitelist = []

#outfile = 'oceaniacities.js'
#latrng = [-46,9]
#pop = 10000
#lonrng = [72,180]
#blacklist =  ['Thailand', 'Sri Lanka', 'India', 'Philippines']
#whitelist = []

# outfile = 'asiacities.js'
# latrng = [2,59]
# pop = 400000
# lonrng = [27,156]
# blacklist = ['Egypt', 'Ethiopia', 'Ukraine', 'Djibouti', 'Moldova', 'Eritrea', 'Cyprus', 'South Sudan', 'Northern Mariana Islands', 'Guam', 'Macau', 'Sudan', 'Belarus', 'Somalia']
# whitelist = []

#outfile = 'samericacities.js'
#latrng = [-54,20]
#pop = 50000
#lonrng = [-138, -58]
#blacklist = ['Mexico', 'Haiti', 'El Salvador', 'Costa Rica', 'Panama', 'Guatemala', 'Honduras', 'Jamaica', 'Nicaragua',  'Belize', 'Martinique', 'Guadeloupe']
#whitelist = []

# outfile = 'eurocities.js'
# latrng = [37,64]
# pop = 100000
# lonrng = [-36, 52]
# blacklist = ['Azerbaijan', 'Iran', 'Armenia', 'Georgia', 'Kazakhstan', 'Iraq', 'Syria']
# whitelist = ['Isle Of Man', 'Gibraltar']

outfile = 'africacities.js'
latrng = [-34,39]
pop = 100000
lonrng = [-58, 80]
blacklist = ['India', 'Brazil', 'Pakistan', 'Iran', 'Iraq', 'Saudi Arabia', 'Afghanistan', 'Greece', 'Israel', 'Portugal', 'Syria', 'Turkey', 'Kuwait', 'Yemen', 'Paraguay', 'Lebanon', 'Qatar', 'United Arab Emirates', 'Spain', 'Tajikistan', 'Jordan', 'Oman', 'Turkmenistan', 'Bahrain', 'Malta', 'Suriname', 'Cyprus', 'Sri Lanka', 'Maldives', 'West Bank', 'Italy', 'Uzbekistan', 'China', 'Argentina', 'Uruguay']
whitelist = ['Gibraltar']

countries = []
with open(file) as json_file:
    data = json.load(json_file)
    filtered = []
    for entry in data:
        thisPop = 0 if (entry['population'] == '') else int(entry['population'])
        thisCap = ((entry['iso2'] == 'US' or entry['iso2'] == 'CN' or entry['iso2'] == 'CA') and  entry['capital'] == 'admin') or entry['capital'] == 'primary'
        wrongContinent = entry['country'] in blacklist
        mustKeep = entry['country'] in whitelist
        if (mustKeep or (not wrongContinent and entry['lat'] < latrng[1] and entry['lat'] > latrng[0] and entry['lng'] < lonrng[1] and entry['lng'] > lonrng[0] and (thisPop >= pop or thisCap))):
            filtered.append(entry)
            if (entry['country'] not in countries):
                countries.append(entry['country'])
    print(len(filtered))
    print(countries)
    with open(outfile, 'w') as data_file:
        json.dump(filtered, data_file, indent=2)

