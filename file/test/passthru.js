const fs = require('fs');
const { Transform, PassThrough } = require('stream');

const rs = fs.createReadStream('./txtfile.txt');
var stats = fs.statSync('./txtfile.txt');

const ws = fs.createWriteStream('./streamedtxtfile.txt');
//class Uppercase extends Transform {
//    constructor() {
//        super();
//    }
//    _transform(chunk, encoding, callback) {
//        this.push(chunk.toString().toUpperCase());
//        console.log('in _transform', chunk.length);

//        callback();
//    }

//    _flush(cb) {
//        this.push();
//        console.log('in _flush');
//        cb();
//    }
//}

// passthrough stream example  newly added
//let bytesWritten=0;
//const monitor = new PassThrough();
//monitor.on('data', (chunk) => {
//    bytesWritten += chunk.length;
//    console.log('in event data - ' + bytesWritten);
//});
//monitor.on('finish', () => {
//    console.log(`passthrough, ${bytesWritten} bytes written`);
//});

//rs.pipe(monitor).pipe(new Uppercase()).pipe(newFile);
// rs.pipe(new Uppercase()).pipe(newFile);
//rs.pipe(monitor).pipe(newFile);

///////////////////////
let consolidatedUploadSize = 0;
rs.on('error', function (err) {
    console.log('rs error', err);
});
rs.on('drain', function () {
    console.log('rs drain');
});
rs.on('unpipe', function () {
    console.log('rs drain');
});
rs.on('close', function () {
    console.log('rs close');
});
rs.on('data', (chunk) => {
    consolidatedUploadSize += chunk.length;
    console.log('rs progress = ' + consolidatedUploadSize * 100 / stats.size);
});
rs.on('end', () => {
    console.log('rs end');
});
rs.on('finish', () => {
    console.log('rs finish');
});
///////////////////////

///////////////////////
let monconsolidatedUploadSize = 0;
const monitor = new PassThrough();

monitor.on('error', function (err) {
    console.log('monitor error', err);
});
monitor.on('drain', function () {
    console.log('monitor drain');
});
monitor.on('unpipe', function () {
    console.log('monitor drain');
});
monitor.on('close', function () {
    console.log('monitor close');
});
monitor.on('data', (chunk) => {
    monconsolidatedUploadSize += chunk.length;
    console.log('monitor progress = ' + monconsolidatedUploadSize * 100 / stats.size);
});
monitor.on('end', () => {
    console.log('monitor end');
});
monitor.on('finish', () => {
    console.log('monitor finish');
});
///////////////////////

///////////////////////
let wsconsolidatedUploadSize = 0;
ws.on('error', function (err) {
    console.log('ws error', err);
});
ws.on('drain', function () {
    console.log('ws drain');
});
ws.on('unpipe', function () {
    console.log('ws drain');
});
ws.on('close', function () {
    console.log('ws close');
});
ws.on('data', (chunk) => {
    wsconsolidatedUploadSize += chunk.length;
    console.log('ws progress = ' + wsconsolidatedUploadSize * 100 / stats.size);
});
ws.on('end', () => {
    console.log('ws end');
});
ws.on('finish', () => {
    console.log('ws finish');
});
///////////////////////

//rs.pipe(ws);
rs.pipe(monitor).pipe(ws);
