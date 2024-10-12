module.exports = {
    FILE: {
        DATABASE: {
            CONNECT: {
                URL_READ_ONLY: 'file.database.connect.url.read_only',
                URL_READ_WRITE: 'file.database.connect.url.read_write'
            }
        },
        AWS: {
            API_VERSION: 'file.aws.api_version',
            REGION_S3: 'file.aws.region_s3',
            BUCKET_NAME: 'file.aws.bucket_name',
            SECRET_KEY_S3: 'file.aws.secret_key_s3',
            KEY_ID_S3: 'file.aws.key_id_s3',
            REGION: 'file.aws.region',
            KEY_ID: 'file.aws.key_id',
            SECRET_KEY: 'file.aws.secrect_key',
            TOPIC: 'file.aws.topic'
        },
        MAXIMUM: {
            FILE_UPLOAD: {
                SIZE: {
                    BYTES: {
                        PROFILE_IMAGE: 'file.maximum.file_upload.size.bytes.profile_image',
                        MY_VIDEO: 'file.maximum.file_upload.size.bytes.my_video',
                        CSV_FILE: 'file.maximum.file_upload.size.bytes.csv_file'
                    }
                }
            }
        }
    }
};