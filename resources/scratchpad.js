// File for holding js junk that I use to manipulate data and stuff

const fs = require('fs');
const CONSTANTS = require('../resources/constants.js');
const logfile = '/scratch/connections.log';
const WORLDCITIES = require('../resources/worldcities.js').CITIES;
const USCITIES = require('../resources/uscities.js').CITIES;
const EUROCITIES = require('../resources/eurocities.js').CITIES;
const AFRICACITIES = require('../resources/africacities.js').CITIES;
const ASIACITIES = require('../resources/asiacities.js').CITIES;
const OCEANIACITIES = require('../resources/oceaniacities.js').CITIES;
const SAMERICACITIES = require('../resources/samericacities.js').CITIES;
const Geography = require('../server/geography.js');
function copy(x) {
    return JSON.parse( JSON.stringify(x) );
}

// Set up which files
var room = 'World';
var allcities = WORLDCITIES;
var killlist = ["Bakersfield, California, USA", "New Haven, Connecticut, USA"];
scrub(room, allcities, killlist);

room = 'Asia';
allcities = ASIACITIES;
killlist = ["Vila Velha, Espírito Santo, Brazil",  'Douglas, Isle Of Man',  'Gibraltar, Gibraltar',  'Fès, Morocco',  'Giza, Egypt',  'Port Said, Egypt',  'Ismailia, Egypt',  'Benghazi, Libya',  'Armavir, Russia'
];
scrub(room, allcities, killlist);

room = 'S. America';
allcities = SAMERICACITIES;
killlist = ["Vila Velha, Espírito Santo, Brazil"];
scrub(room, allcities, killlist);

console.log('namerica')
room = 'N. America';
allcities = USCITIES;
killlist = ["Vila Velha, Espírito Santo, Brazil",   'Hamilton, Bermuda','Grand Turk, Turks And Caicos Islands','Buffalo, Nat’l River, United States'];
scrub(room, allcities, killlist);

room = 'Europe';
allcities = EUROCITIES;
killlist = [  'Fès, Morocco',  'undefined',  'Samarkand, Uzbekistan',  'Saidu Sharif, Pakistan',  'Giza, Egypt',  'Port Said, Egypt',  'Ismailia, Egypt',  'Homs, Syria',  'Hyderabad City, Pakistan',  'Benghazi, Libya'];
scrub(room, allcities, killlist);

room = 'Africa';
allcities = AFRICACITIES;
killlist = ["Vila Velha, Espírito Santo, Brazil"];
scrub(room, allcities, killlist);

room = 'Oceania';
allcities = OCEANIACITIES;
killlist = [  'Praya, Indonesia',  'Tasikmalaya, Indonesia',  'Kupang, Indonesia',  'Banyuwangi, Indonesia',  'Tuban, Indonesia'];
scrub(room, allcities, killlist);

function scrub(room, allcities, killlist) {
const append = (newEntry, oldDict, newDict) => {
	var newData = newDict
	var oldData = oldDict
        if (newData != null) {
            newData["dists"] = newData["dists"].concat(oldData["dists"]);
            newData["times"] = newData["times"].concat(oldData["times"]);
            newData["ips"] = newData["ips"].concat(oldData["ips"]);
            // Compute new averages
            newData["mean_dist"] = newData["dists"].reduce((a, b) => a + b) / newData["dists"].length;
            newData["mean_time"] = newData["times"].reduce((a, b) => a + b) / newData["times"].length;
            newData["std_dist"] = Math.sqrt(newData["dists"].map(x => Math.pow(x - newData["mean_dist"], 2)).reduce((a, b) => a + b) / newData["dists"].length);
            newData["std_time"] = Math.sqrt(newData["times"].map(x => Math.pow(x - newData["mean_time"], 2)).reduce((a, b) => a + b) / newData["times"].length);
        } else {
            console.log('no new entry for ' + newEntry);
            newData = oldData;
        }
	return newData
}
	
// Load guess history
const file = '/scratch/' + room + '_guesses';
// const file = '/home/mattfel/geoscents_stats/' + room + '.json';
history = JSON.parse(fs.readFileSync(file, 'utf8'));
if (room == "Asia") {
	const toadd = JSON.parse(fs.readFileSync(file.replace('Asia','Europe'), 'utf8'));
	Object.keys(toadd).forEach(k => {
		if (Object.keys(history).filter(val => val == k).length == 1) {
			history[k] = append(k, history[k], toadd[k]);
		} else {
			history[k] = toadd[k]
		}
	})
}
const loggedcities = Object.keys(history);

// Load cities in database
const realcities = Object.keys(allcities).map((v) => Geography.stringifyTarget(allcities[v])['string']);

// Make ascii -> true mapping
var asciitorealmap = {}
Object.keys(allcities).forEach((v) => {
    const asc = Geography.stringifyTargetAscii(allcities[v])['string'];
    const real = Geography.stringifyTarget(allcities[v])['string'];
    if (asc != real) asciitorealmap[asc] = real;
});
//console.log(asciitorealmap)

const diffArray = (arr1, arr2) => arr1.concat(arr2).filter(val => !(arr1.includes(val) && arr2.includes(val)));

const mustUnify = loggedcities.filter(val => !realcities.includes(val));
//console.log("have history but no entry for: ");
//console.log(mustUnify);

const makeNewEntry = (oldEntry) => {
    const justCity = oldEntry.toString().split(',')[0] + ',';
    const justCountry = ',' + oldEntry.toString().split(',')[oldEntry.toString().split(',').length - 1];
    // Name change USA -> United States
    if (oldEntry.toString().endsWith(', USA')) return oldEntry.toString().replace(', USA', ', United States');
    // Name change UK -> United Kingdom
    else if (oldEntry == "Cardiff, UK") return "Caerdydd, United Kingdom"
    else if (oldEntry == "Newcastle, UK") return "Newcastle upon Tyne, United Kingdom"
    else if (oldEntry.toString().endsWith(', UK')) return oldEntry.toString().replace(', UK', ', United Kingdom');
    // Add admin to stringify
    else if (oldEntry == "Natal, Brazil") return "Natal, Rio Grande do Norte, Brazil"
    else if (oldEntry == "Vila Velha, Brazil") return "Vila Velha, Espírito Santo, Brazil"
    else if (loggedcities.filter(val => val.startsWith(justCity) && val.endsWith(justCountry) && val != oldEntry).length == 1) return loggedcities.filter(val => val.startsWith(justCity) && val.endsWith(justCountry) && val != oldEntry)[0];
    // Properly handle special characters
    else if (Object.keys(asciitorealmap).filter(val => val.startsWith(justCity) && val.endsWith(justCountry) && val != oldEntry).length == 1) {
        //console.log('match on ' + oldEntry)
        return asciitorealmap[Object.keys(asciitorealmap).filter(val => val.startsWith(justCity) && val.endsWith(justCountry) && val != oldEntry)[0]];
    }
    else if (Object.keys(asciitorealmap).filter(val => val == oldEntry).length == 1) {
        //console.log('match on ' + oldEntry)
        return asciitorealmap[oldEntry]
    }
    // Hand tuned (i.e. spelling changes)
    else if (oldEntry == "Qui Nhon, Vietnam") return asciitorealmap["Quy Nhon, Vietnam"]
    else if (oldEntry == "Hims, Syria") return "Homs, Syria"
    else if (oldEntry == "Naga, Philippines") return "Naga City, Philippines"
    else if (oldEntry == "Banghazi, Libya") return "Benghazi, Libya"
    else if (oldEntry == "Fez, Morocco") return "Fès, Morocco"
    else if (oldEntry == "Ndjamena, Chad") return asciitorealmap["N'Djamena, Chad"]
    else if (oldEntry == "Makkah, Saudi Arabia") return "Mecca, Saudi Arabia"
    else if (oldEntry == "Taizz, Yemen") return asciitorealmap["Ta`izz, Yemen"]
    else if (oldEntry == "Az Zarqa, Jordan") return asciitorealmap["Az Zarqa', Jordan"]
    else if (oldEntry == "Tucumán, Argentina") return asciitorealmap["San Miguel de Tucuman, Argentina"]
    else if (oldEntry == "Mar del Plata, Argentina") return "La Plata, Argentina"
    else if (oldEntry == "Nampo, Korea, North") return asciitorealmap["Namp'o, Korea, North"]
    else if (oldEntry == "At Taif, Saudi Arabia") return asciitorealmap["At Ta'if, Saudi Arabia"]
    else if (oldEntry == "Fargona, Uzbekistan") return asciitorealmap["Farg`ona, Uzbekistan"]
    else if (oldEntry == "Sohag, Egypt") return asciitorealmap["Suhaj, Egypt"]
    else if (oldEntry == "León, Guanajuato, Mexico") return asciitorealmap["Leon de los Aldama, Guanajuato, Mexico"]
    else if (oldEntry == "Nova Iguaçu, Brazil") return asciitorealmap["Iguacu, Rio de Janeiro, Brazil"]
    else if (oldEntry == "Nukualofa, Tonga") return asciitorealmap["Nuku`alofa, Tonga"]
    else if (oldEntry == "Chongjin, Korea, North") return asciitorealmap["Ch'ongjin, Korea, North"]
    else if (oldEntry == "Isfahan, Iran") return asciitorealmap["Esfahan, Iran"]
    else if (oldEntry == "Acapulco, Guerrero, Mexico") return asciitorealmap["Acapulco de Juarez, Guerrero, Mexico"]
    else if (oldEntry == "Donetsk, Ukraine") return asciitorealmap["Donets'k, Ukraine"]
    else if (oldEntry == "Kerman, Iran") return asciitorealmap["Kermanshah, Iran"]
    else if (oldEntry == "El Mansura, Egypt") return asciitorealmap["Al Mansurah, Egypt"]
    else if (oldEntry == "Ad Damman, Saudi Arabia") return asciitorealmap["Ad Dammam, Saudi Arabia"]
    else if (oldEntry == "Ismaïlia, Egypt") return "Ismailia, Egypt"
    else if (oldEntry == "Baoji, Shaanxi, China") return "Baojishi, Shaanxi, China"
    else if (oldEntry == "Samarqand, Uzbekistan") return "Samarkand, Uzbekistan"
    else if (oldEntry == "El Giza, Egypt") return "Giza, Egypt"
    else if (oldEntry == "Port-of-Spain, Trinidad And Tobago") return "Port of Spain, Trinidad And Tobago"
    else if (oldEntry == "Odessa, Ukraine") return "Odesa, Ukraine"
    else if (oldEntry == "Hyderabad, Pakistan") return "Hyderabad City, Pakistan"
    else if (oldEntry == "Guatemala, Guatemala") return "Guatemala City, Guatemala"
    else if (oldEntry == "Nürnberg, Germany") return "Nuremberg, Germany"
    else if (oldEntry == "Shenyeng, Liaoning, China") return "Shenyang, Liaoning, China"
    else if (oldEntry == "Kalang, Malaysia") return "Klang, Malaysia"
    else if (oldEntry == "Seville, Spain") return "Sevilla, Spain"
    else if (oldEntry == "Saidu, Pakistan") return "Saidu Sharif, Pakistan"
    else if (oldEntry == "Madurai, Tamil Nādu, India") return "Madura, Tamil Nādu, India"
    else if (oldEntry == "Chișinău, Moldova") return "Chisinau, Moldova"
    else if (oldEntry == "Kiev, Ukraine") return "Kyiv, Ukraine"
    else if (oldEntry == "Mudangiang, Heilongjiang, China") return "Mudanjiang, Heilongjiang, China"
    else if (oldEntry == "Bur Said, Egypt") return "Port Said, Egypt"
    else if (oldEntry == "Rostov, Russia") return "Rostov-na-Donu, Rostovskaya Oblast’, Russia"
    else if (oldEntry == "Zamboanga, Philippines") return "Zamboanga City, Philippines"
    else if (oldEntry == "Malé, Maldives") return "Male, Maldives"
    else if (oldEntry == "Sri Jawewardenepura Kotte, Sri Lanka") return "Sri Jayewardenepura Kotte, Sri Lanka"
    else if (oldEntry == "Kaifeng, Henan, China") return "Kaifeng Chengguanzhen, Henan, China"
    else if (oldEntry == "Antwerpen, Belgium") return "Antwerp, Belgium"
    // City was deleted
    else if (realcities.filter(val => val.startsWith(justCity) && val.endsWith(justCountry) && val != oldEntry).length == 0) return "DELETE"
    else return oldEntry
};

const keeplist = ["Macau, Macau", "Nouméa, New Caledonia", "Bhavnagar, Gujarāt, India", "Gibraltar, Gibraltar", "Grand Turk, Turks And Caicos Islands", "Papeete, French Polynesia", "Douglas, Isle Of Man", "Hamilton, Bermuda", "Avarua, Cook Islands", "Stanley, Falkland Islands (Islas Malvinas)"];
const addOldToNew = (oldEntry, newEntry) => {
    if (killlist.filter(val => val == oldEntry || val == newEntry).length == 1 || newEntry == undefined) {
	delete history[oldEntry];
    }
    else if (keeplist.filter( val => val == oldEntry).length == 1) {
        //console.log('preserve ' + oldEntry);
    }
    else if (newEntry == "DELETE") {
        //console.log("killing " + oldEntry)
        delete history[oldEntry];
    } else {
        oldData = history[oldEntry];
        newData = history[newEntry];
        newData = append(newEntry, oldData, newData);
	history[newEntry] = newData;
        delete history[oldEntry];
    }
};
// Unify
mustUnify.forEach(val => {
        const newEntry = makeNewEntry(val);
        if (newEntry != val || killlist.filter(k => k == val || newEntry == k).length == 1) {
            addOldToNew(val, newEntry);
        }
    }
);

// Get rid of Bhavnagar, Gujarāt, India
delete history["Bhavnagar, Gujarāt, India"]

// Check
const loggedcities2 = Object.keys(history);
const mustUnify2 = loggedcities2.filter(val => !realcities.includes(val));
console.log("NOW have history but no entry for: ");
console.log(mustUnify2);


fs.writeFile(file + '_scrub', JSON.stringify(copy(history)), function(err) {if(err){return console.log(err);}});
}
