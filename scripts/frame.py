import os
import json
from pathlib import Path
import urllib.request
import re

geoscents_home='/home/mattfel/geoscents/'

def scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, include_admin):
    countries = []
    file = geoscents_home + 'resources/databases/cities.js'
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


outfile = geoscents_home + 'resources/databases/worldcities.js'
rng = [-180, 180, -65, 77]
pop = 580000
blacklist = []
whitelist = ['Jersey', 'Turks And Caicos Islands', 'Isle of Man', 'Falkland Islands (Islas Malvinas)', 'Bermuda', 'Cook Islands', 'French Polynesia', 'Macau', 'Gibraltar', 'New Caledonia', 'Azores']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/worldcapitalscities.js'
rng = [-180, 180, -65, 77]
pop = 9999999999999 # capital cities only
blacklist = []
whitelist = ['Jersey', 'Turks And Caicos Islands', 'Isle of Man', 'Falkland Islands (Islas Malvinas)', 'Bermuda', 'Cook Islands', 'French Polynesia', 'Macau', 'Gibraltar']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, False)

outfile = geoscents_home + 'resources/databases/namericacities.js'
rng = [-141, -43, 12,54]
pop = 100000
blacklist = ['Barbados', 'Curaçao', 'Aruba', 'Saint Vincent And The Grenadines', 'Saint Lucia', 'Antigua And Barbuda', 'Grenada', 'Dominica', 'Saint Kitts And Nevis', 'Sint Maarten', 'Martinique', 'Guadeloupe']
whitelist = []
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/oceaniacities.js'
rng = [92,252, -51,28]
pop = 10000
blacklist =  ['Macau', 'Thailand', 'Mexico', 'United States', 'Sri Lanka', 'India', 'China', 'Philippines', 'Vietnam', 'Cambodia', 'Laos', 'Hong Kong', 'Taiwan', 'Bangladesh', 'Burma', 'Nepal', 'Bhutan', 'Japan']
whitelist = ['Cook Islands', 'Wallis And Futuna', 'Honolulu', 'Hilo', 'Wailuku', 'Lihue', 'Easter Island', 'Tokelau']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/asiacities.js'
rng = [27,156, 2,59]
pop = 400000
blacklist = ['Egypt', 'Ethiopia', 'Ukraine', 'Djibouti', 'Moldova', 'Eritrea', 'Cyprus', 'South Sudan', 'Northern Mariana Islands', 'Guam', 'Macau', 'Sudan', 'Belarus', 'Somalia']
whitelist = []
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/samericacities.js'
rng = [-138, -30, -54,20]
pop = 61000
blacklist = ['Mexico', 'Haiti', 'El Salvador', 'Costa Rica', 'Panama', 'Guatemala', 'Honduras', 'Jamaica', 'Nicaragua',  'Belize', 'Martinique', 'Guadeloupe', 'Pitcairn Islands']
whitelist = ['Falkland Islands (Islas Malvinas)', 'Galápagos', 'South Georgia And South Sandwich Islands', 'Easter Island']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/europecities.js'
rng = [-36, 52, 37,66]
pop = 100000
blacklist = ['Azerbaijan', 'Iran', 'Armenia', 'Georgia', 'Kazakhstan', 'Iraq', 'Syria', 'Tunisia']
whitelist = ['Isle Of Man', 'Gibraltar', 'Shetland Islands', 'Torshavn', 'Azores', 'Jersey']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/africacities.js'
rng = [-58, 80, -34,39]
pop = 100000
blacklist = ['India', 'Brazil', 'Pakistan', 'Iran', 'Iraq', 'Saudi Arabia', 'Afghanistan', 'Greece', 'Israel', 'Portugal', 'Syria', 'Turkey', 'Kuwait', 'Yemen', 'Paraguay', 'Lebanon', 'Qatar', 'United Arab Emirates', 'Spain', 'Tajikistan', 'Jordan', 'Oman', 'Turkmenistan', 'Bahrain', 'Malta', 'Suriname', 'Cyprus', 'Sri Lanka', 'Maldives', 'West Bank', 'Italy', 'Uzbekistan', 'China', 'Argentina', 'Uruguay']
whitelist = ['Gibraltar']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/ukrainecities.js'
rng = [17.7, 45, 43.2, 54]
pop = 0
blacklist = ['Moldova', 'Belarus', 'Russia', 'Poland', 'Romania', 'Hungary', 'Serbia', 'Bosnia And Herzegovina', 'Czechia', 'Bulgaria', 'Slovakia', 'Gibraltar', 'Croatia', 'Montenegro']
whitelist = []
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/argentinacities.js'
rng = [-102, -20, -56.5, -20]
pop = 30000
blacklist = ['*']
whitelist = ['Argentina']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/australiacities.js'
rng = [97, 170, -45.5, -8]
pop = 15000
blacklist = ['*']
whitelist = ['Australia']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/canadacities.js'
rng = [-160, -15, 38, 77.5]
pop = 15000
blacklist = ['*']
whitelist = ['Canada']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/japancities.js'
rng = [110, 164.5, 23.5, 49]
pop = 0
blacklist = ['*']
whitelist = ['Japan']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/kenyacities.js'
rng = [30, 49, -5.3, 5.9]
pop = 0
blacklist = ['*']
whitelist = ['Kenya']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/romaniacities.js'
rng = [19, 33.7, 43, 49]
pop = 0
blacklist = ['*']
whitelist = ['Romania']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/perucities.js'
rng = [-92, -55, -19.5, 2]
pop = 20000
blacklist = ['*']
whitelist = ['Peru']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/egyptcities.js'
rng = [16.5, 41.7, 20.81, 34]
pop = 0
blacklist = ['*']
whitelist = ['Egypt']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/indonesiacities.js'
rng = [84.5, 151, -23.5, 15]
pop = 90000
blacklist = ['*']
whitelist = ['Indonesia']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/spaincities.js'
rng = [-14.18, 8, 35, 45]
pop = 0
blacklist = ['*']
whitelist = ['Spain']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/chinacities.js'
rng = [62, 148, 16.85, 56]
pop = 500000
blacklist = ['*']
whitelist = ['China']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/unitedstatescities.js'
rng = [-130, -60, 22, 53.7]
pop = 200000
blacklist = ['*']
whitelist = ['United States']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/irancities.js'
rng = [36, 72.6, 24, 42]
pop = 0
blacklist = ['*']
whitelist = ['Iran']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/brazilcities.js'
rng = [-91.7, -17, -34, 8]
pop = 80000
blacklist = ['*']
whitelist = ['Brazil']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/mexicocities.js'
rng = [-120, -80, 13.61, 35]
pop = 0
blacklist = ['*']
whitelist = ['Mexico']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/indiacities.js'
rng = [50, 107.3, 6, 37]
pop = 0
blacklist = ['*']
whitelist = ['India']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/italycities.js'
rng = [-2.1, 25.4, 36, 48]
pop = 0
blacklist = ['*']
whitelist = ['Italy']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/unitedkingdomcities.js'
rng = [-19.55, 15, 49.5, 61]
pop = 1000
blacklist = ['*']
whitelist = ['United Kingdom']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/germanycities.js'
rng = [-2.1, 23, 46.8, 56]
pop = 0
blacklist = ['*']
whitelist = ['Germany']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/francecities.js'
rng = [-10.2, 17, 41, 52]
pop = 0
blacklist = ['*']
whitelist = ['France']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/nigeriacities.js'
rng = [-2.48, 19, 3.5, 16]
pop = 0
blacklist = ['*']
whitelist = ['Nigeria']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/southafricacities.js'
rng = [9, 37, -35.51, -21]
pop = 0
blacklist = ['*']
whitelist = ['South Africa']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/democraticrepublicofthecongocities.js'
rng = [3.53, 41, -14, 8]
pop = 0
blacklist = ['*']
whitelist = ['Congo (Kinshasa)']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/pakistancities.js'
rng = [52.25, 84, 23, 39]
pop = 0
blacklist = ['*']
whitelist = ['Pakistan']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/newzealandcities.js'
rng = [151, 190.4, -49, -31.4]
pop = 0
blacklist = ['*']
whitelist = ['New Zealand']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/turkeycities.js'
rng = [22, 48, 33.14, 45]
pop = 0
blacklist = ['*']
whitelist = ['Turkey']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/switzerlandcities.js'
rng = [4, 12.66, 45, 48.5]
pop = 0
blacklist = ['*']
whitelist = ['Switzerland']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/moroccocities.js'
rng = [-25, 10, 20.03, 38]
pop = 0
blacklist = ['*']
whitelist = ['Morocco']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/philippinescities.js'
rng = [105, 140, 2, 22.15]
pop = 0
blacklist = ['*']
whitelist = ['Philippines']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/southkoreacities.js'
rng = [121, 135.75, 33, 40]
pop = 0
blacklist = ['*']
whitelist = ['Korea, South']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/vietnamcities.js'
rng = [90, 120.1, 8, 25]
pop = 0
blacklist = ['*']
whitelist = ['Vietnam']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/saudiarabiacities.js'
rng = [23.8, 63.5, 15, 36]
pop = 0
blacklist = ['*']
whitelist = ['Saudi Arabia']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/afghanistancities.js'
rng = [56, 78.65, 29, 40]
pop = 0
blacklist = ['*']
whitelist = ['Afghanistan']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/estoniacities.js'
rng = [20, 30, 56.92, 60]
pop = 0
blacklist = ['*']
whitelist = ['Estonia']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/latviacities.js'
rng = [20, 30, 55.285, 58.5]
pop = 0
blacklist = ['*']
whitelist = ['Latvia']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/lithuaniacities.js'
rng = [18.43, 28, 53.8, 57]
pop = 0
blacklist = ['*']
whitelist = ['Lithuania']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/colombiacities.js'
rng = [-90, -55.9, -5, 15]
pop = 0
blacklist = ['*']
whitelist = ['Colombia']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/venezuelacities.js'
rng = [-79.3, -52, -1, 15]
pop = 0
blacklist = ['*']
whitelist = ['Venezuela']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/paraguaycities.js'
rng = [-69.1, -47, -29, -17]
pop = 0
blacklist = ['*']
whitelist = ['Paraguay']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/uruguaycities.js'
rng = [-61.98, -48, -35.5, -28.5]
pop = 0
blacklist = ['*']
whitelist = ['Uruguay']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/boliviacities.js'
rng = [-79, -49.05, -24, -7]
pop = 0
blacklist = ['*']
whitelist = ['Bolivia']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/greaterantillescities.js'
rng = [-85.4, -64.5, 14.43, 26]
pop = 30000
blacklist = ['*']
whitelist = ['Cuba', 'Dominican Republic', 'Haiti', 'Puerto Rico', 'Jamaica', 'Cayman Islands']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/lesserantillescities.js'
rng = [-74, -56.47, 10, 20]
pop = 0
blacklist = ['*']
whitelist = ["Antigua And Barbuda", "Barbados", "Dominica", "Grenada", "Saint Kitts And Nevis", "Saint Lucia", "Saint Vincent And the Grenadines", "Trinidad And Tobago"]
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/kazakhstancities.js'
rng = [42.8, 90, 40, 58]
pop = 0
blacklist = ['*']
whitelist = ['Kazakhstan']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/kyrgyzstancities.js'
rng = [68.6, 81, 38.5, 44]
pop = 0
blacklist = ['*']
whitelist = ['Kyrgyzstan']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/tajikistancities.js'
rng = [64.9, 78, 36, 42]
pop = 0
blacklist = ['*']
whitelist = ['Tajikistan']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/uzbekistancities.js'
rng = [52, 78, 36, 47.41]
pop = 0
blacklist = ['*']
whitelist = ['Uzbekistan']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/turkmenistancities.js'
rng = [50, 72, 34, 44.06]
pop = 0
blacklist = ['*']
whitelist = ['Turkmenistan']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

outfile = geoscents_home + 'resources/databases/portugalcities.js'
rng = [-14.34, 0, 36.5, 43]
pop = 0
blacklist = ['*']
whitelist = ['Portugal']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)