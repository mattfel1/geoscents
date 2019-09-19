const fs = require('fs');
const lineReader = require('line-reader');

const log = (payload) => {
    const currentdate = new Date();
    const timestamp = currentdate.getDate() + "/"
        + (currentdate.getMonth() + 1) + "/"
        + currentdate.getFullYear() + " @ "
        + currentdate.getHours() + ":"
        + currentdate.getMinutes() + ":";
    if (fs.existsSync('/root/connections.log')) {
        fs.appendFile('/root/connections.log', "[" + timestamp + "] " + payload + "\n", function (err) {
            if (err) throw err;
            // console.log('Saved!');
        });
    }
};

const readRecentActivity = (numel) => {
    var result = "";
    if (!fs.existsSync('/tmp/recent_activity')) {
        fs.writeFile('/tmp/recent_activity', "", { flag: 'wx' }, function (err) {
            if (err) throw err;
        });
    }
    fs.readFileSync('/tmp/recent_activity', 'utf-8')
        .split('\n').map( (line, i) => {if (i < numel) result = result + line + "<br>"});
    return result;
};

const prependRecentActivity = (payload) => {
    if (!fs.existsSync('/tmp/recent_activity')) {
        fs.writeFile('/tmp/recent_activity', "", { flag: 'wx' }, function (err) {
            if (err) throw err;
        });
    }
    const data = fs.readFileSync('/tmp/recent_activity')
    const fd = fs.openSync('/tmp/recent_activity', 'w+');
    const insert = new Buffer(payload + "\n")
    fs.writeSync(fd, insert, 0, insert.length, 0);
    fs.writeSync(fd, data, 0, data.length, insert.length);
    fs.close(fd, (err) => {
      if (err) throw err;
    });
};

module.exports = {log, readRecentActivity, prependRecentActivity};