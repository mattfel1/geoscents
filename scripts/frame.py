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
                mustKeep = mustKeep and (thisPop >= pop or thisCap) and (entry['country'] in whitelist)

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


def make_country_list(country, rng, pop):
    lower_country = country.replace(" ", "").replace(".", "").lower()
    outfile = geoscents_home + 'resources/databases/' + lower_country + 'cities.js'
    blacklist = ['*']
    whitelist = [country]
    scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)


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

outfile = geoscents_home + 'resources/databases/southkoreacities.js'
rng = [121, 135.75, 33, 40]
pop = 0
blacklist = ['*']
whitelist = ['Korea, South']
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

outfile = geoscents_home + 'resources/databases/democraticrepublicofthecongocities.js'
rng = [3.53, 41, -14, 8]
pop = 0
blacklist = ['*']
whitelist = ['Congo (Kinshasa)']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True)

make_country_list('Argentina', [-102, -20, -56.5, -20], 30000)
make_country_list('Australia', [97, 170, -45.5, -8], 15000)
make_country_list('Canada', [-160, -15, 38, 77.5], 15000)
make_country_list('Japan', [110, 164.5, 23.5, 49], 0)
make_country_list('Kenya', [30, 49, -5.3, 5.9], 0)
make_country_list('Romania', [19, 33.7, 43, 49], 0)
make_country_list('Peru', [-92, -55, -19.5, 2], 20000)
make_country_list('Egypt', [16.5, 41.7, 20.81, 34], 0)
make_country_list('Indonesia', [84.5, 151, -23.5, 15], 90000)
make_country_list('Spain', [-14.18, 8, 35, 45], 0)
make_country_list('China', [62, 148, 16.85, 56], 500000)
make_country_list('United States', [-130, -60, 22, 53.7], 200000)
make_country_list('Iran', [36, 72.6, 24, 42], 0)
make_country_list('Brazil', [-91.7, -17, -34, 8], 80000)
make_country_list('Mexico', [-120, -80, 13.61, 35], 0)
make_country_list('India', [50, 107.3, 6, 37], 0)
make_country_list('Italy', [-2.1, 25.4, 36, 48], 0)
make_country_list('United Kingdom', [-19.55, 15, 49.5, 61], 1000)
make_country_list('Germany', [-2.1, 23, 46.8, 56], 0)
make_country_list('France', [-10.2, 17, 41, 52], 0)
make_country_list('Nigeria', [-2.48, 19, 3.5, 16], 0)
make_country_list('South Africa', [9, 37, -35.51, -21], 0)
make_country_list('Pakistan', [52.25, 84, 23, 39], 0)
make_country_list('New Zealand', [151, 190.4, -49, -31.4], 0)
make_country_list('Turkey', [22, 48, 33.14, 45], 0)
make_country_list('Switzerland', [4, 12.66, 45, 48.5], 0)
make_country_list('Morocco', [-25, 10, 20.03, 38], 0)
make_country_list('Philippines', [105, 140, 2, 22.15], 0)
make_country_list('Vietnam', [90, 120.1, 8, 25], 0)
make_country_list('Saudi Arabia', [23.8, 63.5, 15, 36], 0)
make_country_list('Afghanistan', [56, 78.65, 29, 40], 0)
make_country_list('Estonia', [20, 30, 56.92, 60], 0)
make_country_list('Latvia', [20, 30, 55.285, 58.5], 0)
make_country_list('Lithuania', [18.43, 28, 53.8, 57], 0)
make_country_list('Colombia', [-90, -55.9, -5, 15], 0)
make_country_list('Venezuela', [-79.3, -52, -1, 15], 0)
make_country_list('Paraguay', [-69.1, -47, -29, -17], 0)
make_country_list('Uruguay', [-61.98, -48, -35.5, -28.5], 0)
make_country_list('Bolivia', [-79, -49.05, -24, -7], 0)
make_country_list('Kazakhstan', [42.8, 90, 40, 58], 0)
make_country_list('Kyrgyzstan', [68.6, 81, 38.5, 44], 0)
make_country_list('Tajikistan', [64.9, 78, 36, 42], 0)
make_country_list('Uzbekistan', [52, 78, 36, 47.41], 0)
make_country_list('Turkmenistan', [50, 72, 34, 44.06], 0)
make_country_list('Portugal', [-14.34, 0, 36.5, 43], 0)
make_country_list('Bangladesh', [84.03, 97, 20.5, 27.5], 0)
make_country_list('Cambodia', [100.47, 110, 10, 15.5], 0)
make_country_list('Cameroon', [0, 23.95, 1, 15], 0)
make_country_list('Niger', [-3.9, 21.05, 11, 25], 0)
make_country_list('Chad', [2, 33.8, 7, 25], 0)
make_country_list('Central African Republic', [11.78, 29, 2.1, 12.2], 0)
make_country_list('Mali', [-19, 11.37, 9.5, 26.5], 0)
