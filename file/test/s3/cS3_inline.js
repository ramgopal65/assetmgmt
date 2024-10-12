/////////Logging with timestame - start
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
/////////Logging with timestame - end


/////////for s3 operations  start
const Region = 'ap-south-1';
const AccessKeyId = 'AKIA6F53773QPIAXLQ5X';
const SecretAccessKey = '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';
const BucketName = 'visit.ai-prod';

const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');
// Configure AWS client
const s3ClientForInlineUpload = new S3Client({
    region: Region,
    credentials: {
        accessKeyId: AccessKeyId,
        secretAccessKey: SecretAccessKey
    }
});
/////////for s3 operations  end


async function myMain(){
    /////////from source  start
    var fs = require('fs');
    let file = '300mb.txt';
    var buffer = fs.readFileSync('./' + file);
    /////////from source  end

    /////////for progress monitor  start
    let consolidatedUploadSize = 0;
    //Cannot monitor progress
    /////////for progress monitor  end

    /////////to destination  start
    const putCommand = new PutObjectCommand({
        Bucket: BucketName,
        Key: 'test/cS3_inline/' + file,
        Body: buffer,
    });

    console.log('cS3_inline - ' + file + ' - start');
    let result = await s3ClientForInlineUpload.send(putCommand);
    console.log('cS3_inline - ' + file + ' - end');
    /////////to destination  end
}

myMain();