import os
import json
from pathlib import Path
import urllib.request
import re
import warnings

home=os.environ['HOME']
geoscents_home = home + '/geoscents/'
big_countries = ['US', 'CN', 'CA', 'AU', 'IN', 'BR']

def scrape_list(outfile, latrng, lonrng, pop, blacklist, whitelist, include_big_admin, include_any_admin, errors, wanted_min = 15, wanted_max = 1000):
    countries = []
    file = geoscents_home + 'resources/databases/cities.js'
    error_msg = ""
    with open(file) as json_file:
        data = json.load(json_file)
        filtered = []
        for entry in data:
            thisPop = 0 if (entry['population'] == '') else int(entry['population'])
            isBigCountry = entry['iso2'] in big_countries
            thisMinorCap = entry['capital'] == 'admin'
            thisCap = (((include_big_admin and isBigCountry) or include_any_admin) and thisMinorCap) or entry['capital'] == 'primary'
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
        if (len(filtered) < wanted_min):
            error_msg = "WARNING! " + str(len(filtered)) + " may not be enough entries! (whitelist = " + ','.join(whitelist) +", blacklist = " + ','.join(blacklist) + ", wanted >= " + str(wanted_min) + ")"
        elif (len(filtered) > wanted_max):
            error_msg = "WARNING! " + str(len(filtered)) + " may be too many entries! (whitelist = " + ','.join(whitelist) +", blacklist = " + ','.join(blacklist) + ", wanted < " + str(wanted_max) +  ")"

        string_data = json.dumps(filtered, indent=2)
        with open(outfile, 'w') as data_file:
            data_file.write("module.exports = { CITIES: ")
            data_file.write(string_data)
            data_file.write("}")
    if (error_msg != ""):
        errors.append(error_msg)


def make_country_list(country, rng, pop, errors):
    lower_country = country.replace(" ", "").replace(".", "").lower()
    outfile = geoscents_home + 'resources/databases/' + lower_country + '.js'
    blacklist = ['*']
    whitelist = [country]
    scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True, True, errors)

def make_region_list(filename, rng, pop, whitelist, errors):
    outfile = geoscents_home + 'resources/databases/' + filename + '.js'
    blacklist = ['*']
    scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True, False, errors, 50, 300)

errors = []

outfile = geoscents_home + 'resources/databases/world.js'
rng = [-180, 180, -65, 77]
pop = 610000
blacklist = []
whitelist = ['Jersey', 'Turks And Caicos Islands', 'Isle of Man', 'Falkland Islands (Islas Malvinas)', 'Bermuda', 'Cook Islands', 'French Polynesia', 'Macau', 'Gibraltar', 'New Caledonia', 'Azores']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True, False, errors)

outfile = geoscents_home + 'resources/databases/worldcapitals.js'
rng = [-180, 180, -65, 77]
pop = 9999999999999 # capital cities only
blacklist = []
whitelist = ['Jersey', 'Turks And Caicos Islands', 'Isle of Man', 'Falkland Islands (Islas Malvinas)', 'Bermuda', 'Cook Islands', 'French Polynesia', 'Macau', 'Gibraltar']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, False, False, errors)

outfile = geoscents_home + 'resources/databases/namerica.js'
rng = [-141, -43, 12,54]
pop = 100000
blacklist = ['Barbados', 'Curaçao', 'Aruba', 'Saint Vincent And The Grenadines', 'Saint Lucia', 'Antigua And Barbuda', 'Grenada', 'Dominica', 'Saint Kitts And Nevis', 'Sint Maarten', 'Martinique', 'Guadeloupe']
whitelist = []
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True, False, errors)

outfile = geoscents_home + 'resources/databases/namericacapitals.js'
rng = [-141, -43, 12,54]
pop = 999999999
blacklist = ['Barbados', 'Curaçao', 'Aruba', 'Saint Vincent And The Grenadines', 'Saint Lucia', 'Antigua And Barbuda', 'Grenada', 'Dominica', 'Saint Kitts And Nevis', 'Sint Maarten', 'Martinique', 'Guadeloupe']
whitelist = []
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True, False, errors)

outfile = geoscents_home + 'resources/databases/oceania.js'
rng = [92,252, -51,28]
pop = 10000
blacklist =  ['Macau', 'Thailand', 'Mexico', 'United States', 'Sri Lanka', 'India', 'China', 'Philippines', 'Vietnam', 'Cambodia', 'Laos', 'Hong Kong', 'Taiwan', 'Bangladesh', 'Burma', 'Nepal', 'Bhutan', 'Japan', 'Myanmar']
whitelist = ['Cook Islands', 'Wallis And Futuna', 'Honolulu', 'Hilo', 'Wailuku', 'Lihue', 'Easter Island', 'Tokelau']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True, False, errors)

outfile = geoscents_home + 'resources/databases/oceaniacapitals.js'
rng = [92,252, -51,28]
pop = 9999999999
blacklist =  ['Macau', 'Thailand', 'Mexico', 'United States', 'Sri Lanka', 'India', 'China', 'Philippines', 'Vietnam', 'Cambodia', 'Laos', 'Hong Kong', 'Taiwan', 'Bangladesh', 'Burma', 'Nepal', 'Bhutan', 'Japan', 'Myanmar']
whitelist = ['Cook Islands', 'Wallis And Futuna', 'Honolulu', 'Hilo', 'Wailuku', 'Lihue', 'Easter Island', 'Tokelau']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True, False, errors)

outfile = geoscents_home + 'resources/databases/asia.js'
rng = [27,156, 2,59]
pop = 400000
blacklist = ['Egypt', 'Ethiopia', 'Ukraine', 'Djibouti', 'Moldova', 'Eritrea', 'Cyprus', 'South Sudan', 'Northern Mariana Islands', 'Guam', 'Macau', 'Sudan', 'Belarus', 'Somalia', 'Somaliland']
whitelist = []
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True, False, errors)

outfile = geoscents_home + 'resources/databases/asiacapitals.js'
rng = [27,156, 2,59]
pop = 999999999
blacklist = ['Egypt', 'Ethiopia', 'Ukraine', 'Djibouti', 'Moldova', 'Eritrea', 'Cyprus', 'South Sudan', 'Northern Mariana Islands', 'Guam', 'Macau', 'Sudan', 'Belarus', 'Somalia', 'Somaliland']
whitelist = []
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True, False, errors)

outfile = geoscents_home + 'resources/databases/samerica.js'
rng = [-138, -30, -54,20]
pop = 61000
blacklist = ['Mexico', 'Haiti', 'El Salvador', 'Costa Rica', 'Panama', 'Guatemala', 'Honduras', 'Jamaica', 'Nicaragua',  'Belize', 'Martinique', 'Guadeloupe', 'Pitcairn Islands']
whitelist = ['Falkland Islands (Islas Malvinas)', 'Galápagos', 'South Georgia And South Sandwich Islands', 'Easter Island']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True, False, errors)

outfile = geoscents_home + 'resources/databases/samericacapitals.js'
rng = [-138, -30, -54,20]
pop = 9999999
blacklist = ['Mexico', 'Haiti', 'El Salvador', 'Costa Rica', 'Panama', 'Guatemala', 'Honduras', 'Jamaica', 'Nicaragua',  'Belize', 'Martinique', 'Guadeloupe', 'Pitcairn Islands']
whitelist = ['Falkland Islands (Islas Malvinas)', 'Galápagos', 'South Georgia And South Sandwich Islands', 'Easter Island']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True, False, errors)

outfile = geoscents_home + 'resources/databases/europe.js'
rng = [-36, 52, 37,66]
pop = 100000
blacklist = ['Azerbaijan', 'Iran', 'Armenia', 'Georgia', 'Kazakhstan', 'Iraq', 'Syria', 'Tunisia']
whitelist = ['Isle Of Man', 'Gibraltar', 'Shetland Islands', 'Torshavn', 'Azores', 'Jersey']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True, False, errors)

outfile = geoscents_home + 'resources/databases/europecapitals.js'
rng = [-36, 52, 37,66]
pop = 9999999999
blacklist = ['Azerbaijan', 'Iran', 'Armenia', 'Georgia', 'Kazakhstan', 'Iraq', 'Syria', 'Tunisia']
whitelist = ['Isle Of Man', 'Gibraltar', 'Shetland Islands', 'Torshavn', 'Azores', 'Jersey']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True, False, errors)

outfile = geoscents_home + 'resources/databases/africa.js'
rng = [-58, 80, -34,39]
pop = 100000
blacklist = ['India', 'Brazil', 'Pakistan', 'Iran', 'Iraq', 'Saudi Arabia', 'Afghanistan', 'Greece', 'Israel', 'Portugal', 'Syria', 'Turkey', 'Kuwait', 'Yemen', 'Paraguay', 'Lebanon', 'Qatar', 'United Arab Emirates', 'Spain', 'Tajikistan', 'Jordan', 'Oman', 'Turkmenistan', 'Bahrain', 'Malta', 'Suriname', 'Cyprus', 'Sri Lanka', 'Maldives', 'West Bank', 'Italy', 'Uzbekistan', 'China', 'Argentina', 'Uruguay']
whitelist = ['Gibraltar']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True, False, errors)

outfile = geoscents_home + 'resources/databases/africacapitals.js'
rng = [-58, 80, -34,39]
pop = 999999999 # caps only
blacklist = ['India', 'Brazil', 'Pakistan', 'Iran', 'Iraq', 'Saudi Arabia', 'Afghanistan', 'Greece', 'Israel', 'Portugal', 'Syria', 'Turkey', 'Kuwait', 'Yemen', 'Paraguay', 'Lebanon', 'Qatar', 'United Arab Emirates', 'Spain', 'Tajikistan', 'Jordan', 'Oman', 'Turkmenistan', 'Bahrain', 'Malta', 'Suriname', 'Cyprus', 'Sri Lanka', 'Maldives', 'West Bank', 'Italy', 'Uzbekistan', 'China', 'Argentina', 'Uruguay']
whitelist = ['Gibraltar']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True, False, errors)

make_region_list("mesopotamia", [33.7, 52, 29, 38], 5000, ["Iraq", "Iran", "Kuwait", "Syria", "Turkey", "Lebanon", "Israel"], errors)
make_region_list("benelux", [-1.65, 12, 49, 54], 50, ["Belgium", "Netherlands", "Luxembourg"], errors)
make_region_list("caucuses", [35, 51, 38, 45.06], 5000, ["Russia", "Azerbaijan", "Armenia", "Georgia", "Turkey", "Iran"], errors)
make_region_list("africangreatlakes", [18, 52.1, -15, 5], 70000, ["Rwanda", "Burundi", "Kenya", "Uganda", "Tanzania", "Malawi", "Congo (Kinshasa)"], errors)
make_region_list("arctic", [-180, 180, 62.7, 90], 50, ["Russia", "Canada", "United States", "Iceland", "Faroe Islands", "Finland", "Sweden", "Norway", "Greenland"], errors)
make_region_list("alps", [3.33, 18, 43, 49], 80000, ["Austria", "Switzerland", "France", "Germany", "Italy", "Liechtenstein", "Monaco", "Slovenia"], errors)
make_region_list("amazon", [-84, -34.3, -19, 10], 300000, ["Brazil", "Ecuador", "Peru", "Bolivia", "Colombia", "Venezuela", "Suriname", "Guyana", "French Guiana"], errors)
make_region_list("eastasia", [94.5, 157, 20, 49.65], 1500000, ["Japan", "China", "Korea, South", "Korea, North", "Taiwan", "Mongolia", "Hong Kong", "Macau", "Russia"], errors)
make_region_list("himalayas", [69, 98.62, 23, 38], 300000, ["India", "China", "Pakistan", "Afghanistan", "Nepal", "Bhutan"], errors)
make_region_list("indochina", [77, 152, -10.5, 32], 300000, ["Brunei", "Cambodia", "Timor-Leste", "Indonesia", "Laos", "Malaysia", "Myanmar", "Philippines", "Singapore", "Thailand", "Vietnam"], errors)
make_region_list("nordic", [-25, 50, 52.2, 72], 20000, ["Sweden", "Finland", "Norway", "Iceland", "Denmark", "Faroe Islands"], errors)
make_region_list("polynesia", [129, 270, -49, 26], 0, ["French Polynesia", "New Zealand", "Tuvalu", "Tonga", "Cook Islands", "American Samoa", "Samoa", "Pitcairn Islands", "Niue", "Tokelau", "Wallis And Futuna", "Easter Island", "United States", "Chile"], errors)
make_region_list("balkans", [5, 39, 34.15, 49.05], 50000, ["Slovenia", "Croatia", "Bosnia and Herzegovina", "Serbia", "Montenegro", "Albania", "Macedonia", "Greece", "Bulgaria", "Romania"], errors)
make_region_list("greaterantilles", [-85.4, -64.5, 14.43, 26], 0, ['Cuba', 'Dominican Republic', 'Haiti', 'Puerto Rico', 'Jamaica', 'Cayman Islands'], errors)
make_region_list("lesserantilles", [-74, -56.47, 10, 20], 0, ["Antigua And Barbuda", "Barbados", "Dominica", "Grenada", "Saint Kitts And Nevis", "Saint Lucia", "Saint Vincent And the Grenadines", "Trinidad And Tobago"], errors)
make_region_list("sahara", [-19, 49.2, 6, 42], 200000, ["Morocco", "Algeria", "Tunisia", "Libya", "Egypt", "Mauritania", "Mali", "Niger", "Chad", "Sudan", "Eritrea", "Senegal", "Gambia, The", "Burkina Faso"], errors)
make_region_list("arabia", [23.1, 68, 12, 36], 200000, ["Kuwait", "Oman", "Qatar", "Saudi Arabia", "Yemen", "Iraq", "Jordan", "United Arab Emirates"], errors)
make_region_list("thestans", [28, 106, 23, 57], 200000, ["Kazakhstan", "Turkmenistan", "Uzbekistan", "Pakistan", "Afghanistan", "Tajikistan", "Kyrgyzstan"], errors)

outfile = geoscents_home + 'resources/databases/democraticrepublicofthecongo.js'
rng = [3.53, 41, -14, 8]
pop = 0
blacklist = ['*']
whitelist = ['Congo (Kinshasa)']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True, False, errors)

outfile = geoscents_home + 'resources/databases/southkorea.js'
rng = [121, 135.75, 33, 40]
pop = 0
blacklist = ['*']
whitelist = ['Korea, South']
scrape_list(outfile, rng[2:], rng[:2], pop, blacklist, whitelist, True, False, errors)

make_country_list('Ukraine', [17.7, 45, 43.2, 54], 0, errors)
make_country_list('Argentina', [-102, -20, -56.5, -20], 30000, errors)
make_country_list('Australia', [97, 170, -45.5, -8], 15000, errors)
make_country_list('Canada', [-160, -15, 38, 77.5], 15000, errors)
make_country_list('Liechtenstein', [9.189, 9.887, 47.02, 47.3], 0, errors)
make_country_list('Japan', [110, 164.5, 23.5, 49], 0, errors)
make_country_list('Kenya', [30, 49, -5.3, 5.9], 0, errors)
make_country_list('Romania', [19, 33.7, 43, 49], 0, errors)
make_country_list('Peru', [-92, -55, -19.5, 2], 20000, errors)
make_country_list('Egypt', [16.5, 41.7, 20.81, 34], 0, errors)
make_country_list('Indonesia', [84.5, 151, -23.5, 15], 90000, errors)
make_country_list('Spain', [-14.18, 8, 35, 45], 0, errors)
make_country_list('China', [62, 148, 16.85, 56], 500000, errors)
make_country_list('United States', [-130, -60, 22, 53.7], 200000, errors)
make_country_list('Iran', [36, 72.6, 24, 42], 0, errors)
make_country_list('Brazil', [-91.7, -17, -34, 8], 80000, errors)
make_country_list('Mexico', [-120, -80, 13.61, 35], 0, errors)
make_country_list('India', [50, 107.3, 6, 37], 0, errors)
make_country_list('Italy', [-2.1, 25.4, 36, 48], 0, errors)
make_country_list('United Kingdom', [-19.55, 15, 49.5, 61], 1000, errors)
make_country_list('Germany', [-2.1, 23, 46.8, 56], 0, errors)
make_country_list('France', [-10.2, 17, 41, 52], 0, errors)
make_country_list('Nigeria', [-2.48, 19, 3.5, 16], 0, errors)
make_country_list('South Africa', [9, 37, -35.51, -21], 0, errors)
make_country_list('Pakistan', [52.25, 84, 23, 39], 0, errors)
make_country_list('New Zealand', [151, 190.4, -49, -31.4], 0, errors)
make_country_list('Turkey', [22, 48, 33.14, 45], 0, errors)
make_country_list('Switzerland', [4, 12.66, 45, 48.5], 0, errors)
make_country_list('Morocco', [-25, 10, 20.03, 38], 0, errors)
make_country_list('Philippines', [105, 140, 2, 22.15], 0, errors)
make_country_list('Vietnam', [90, 120.1, 8, 25], 0, errors)
make_country_list('Saudi Arabia', [23.8, 63.5, 15, 36], 0, errors)
make_country_list('Afghanistan', [56, 78.65, 29, 40], 0, errors)
make_country_list('Estonia', [20, 30, 56.92, 60], 0, errors)
make_country_list('Latvia', [20, 30, 55.285, 58.5], 0, errors)
make_country_list('Lithuania', [18.43, 28, 53.8, 57], 0, errors)
make_country_list('Colombia', [-90, -55.9, -5, 15], 0, errors)
make_country_list('Venezuela', [-79.3, -52, -1, 15], 0, errors)
make_country_list('Paraguay', [-69.1, -47, -29, -17], 0, errors)
make_country_list('Uruguay', [-61.98, -48, -35.5, -28.5], 0, errors)
make_country_list('Bolivia', [-79, -49.05, -24, -7], 0, errors)
make_country_list('Kazakhstan', [42.8, 90, 40, 58], 0, errors)
make_country_list('Kyrgyzstan', [68.6, 81, 38.5, 44], 0, errors)
make_country_list('Tajikistan', [64.9, 78, 36, 42], 0, errors)
make_country_list('Uzbekistan', [52, 78, 36, 47.41], 0, errors)
make_country_list('Turkmenistan', [50, 72, 34, 44.06], 0, errors)
make_country_list('Portugal', [-14.34, 0, 36.5, 43], 0, errors)
make_country_list('Bangladesh', [84.03, 97, 20.5, 27.5], 0, errors)
make_country_list('Cambodia', [100.47, 110, 10, 15.5], 0, errors)
make_country_list('Cameroon', [0, 23.95, 1, 15], 0, errors)
make_country_list('Niger', [-3.9, 21.05, 11, 25], 0, errors)
make_country_list('Chad', [2, 33.8, 7, 25], 0, errors)
make_country_list('Central African Republic', [11.78, 29, 2.1, 12.2], 0, errors)
make_country_list('Mali', [-19, 11.37, 9.5, 26.5], 0, errors)
make_country_list('Russia', [19, 190, 31.5, 79], 30000, errors)
make_country_list('Ethiopia', [28, 53.85, 3, 18], 0, errors)
make_country_list('Thailand', [87, 116.65, 5, 22], 0, errors)
make_country_list('Tanzania', [24, 45, -12, 0.35], 0, errors)
make_country_list('Myanmar', [78, 117, 8.5, 30.1], 0, errors)
make_country_list('Algeria', [-17.8, 23, 18, 39], 0, errors)
make_country_list('Sudan', [15, 45, 7.5, 24.5], 0, errors)
make_country_list('Uganda', [27, 38.335, -1.7, 5], 0, errors)
make_country_list('Iraq', [32.65, 53, 28.5, 38.5], 0, errors)
make_country_list('Poland', [8.15, 29, 48.5, 56], 0, errors)



print("\n")
for err in errors:
    print(err)