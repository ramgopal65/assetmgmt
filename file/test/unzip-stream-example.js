const fs = require('fs');
const rs = fs.createReadStream('./coach1-review-post.zip');
//const fstream = require('fstream');
//var writeStream = fstream.Writer('temppath/output');

//const ws = fs.createWriteStream('./temppath/output');
var unzipper = require('unzipper');
const Util = require('util');

var consoleFuncs = {
    log: console.log.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console)
};
Object.keys(consoleFuncs).forEach(function (k) {
    console[k] = function () {
        var K = k.toUpperCase();
        arguments[0] = Util.format('[' + new Date().toISOString() + ']' + '[' + K + ']', arguments[0]);
        consoleFuncs[k].apply(console, arguments);
    };
});


async function myMain() {
//    await rs.pipe(unzipper.Parse())
//        .on('entry', function (entry) {
//            const fileName = entry.path;
//            const type = entry.type; // 'Directory' or 'File'
//            const size = entry.vars.uncompressedSize; // There is also compressedSize;
//            //entry.autodrain();
//            entry.pipe(fs.createWriteStream('./output/' + fileName));
//            console.log(fileName, type, size);
//        })
//        .on('finish', function () {
//            //Extraction done, you can do any cleanup or navigation here.
//            console.log('finish');
//        })
//        .on('error', () => console.log('Error'));

    const zip = rs.pipe(unzipper.Parse({ forceStream: true })) 
    for await (const entry of zip) {
        const fileName = entry.path;
        const type = entry.type; // 'Directory' or 'File'
        const size = entry.vars.uncompressedSize; // There is also compressedSize;
        entry.pipe(fs.createWriteStream('./output/' + fileName));
        console.log(fileName, type, size);
    }



}

myMain();



//const zip = rs.pipe(unzipper.Parse({ forceStream: true }));
//for (const entry of zip) {
//    const fileName = entry.path;
//    const type = entry.type; // 'Directory' or 'File'
//    const size = entry.vars.uncompressedSize; // There is also compressedSize;
//    console.log(fileName, type, size);
//    entry.autodrain();
//}



//rs.pipe(unzipper.Extract({ path: 'output/path' }));