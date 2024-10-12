module.exports = {
    FILE: {
        APP_ACTION: {
            RESOURCE: {
                FILE: 'file',
            },
            ACTION: {
                FILE: {
                    CHUNK_UPLOAD: 'chunk_upload',
                    CHUNK_READ: 'chunk_read',
                    DELETE: 'delete',
                }
            }
        },
        GENERIC: {
            STARTING_SERVER: 'starting file http server',
            ERROR: 'error in file.',
            EXITING: 'exiting file abruptly...',
            PROVISION_ERROR: 'provision failed.',
            PROVISION_SUCCESS: 'provision successful.',
            PORT_REQUIRES_ELEVATED_PRIVILEDGES: ' requires elevated privileges',
            PORT_ALREADY_IN_USE: ' is already in use',
            SERVER_LISSTENING_ON_PORT: 'file http server listening on ',
            SERVER_ALREADY_RUNNING_ON_PORT: 'file http server is already running on port - ',
        },
        PROVISION: {
            START: 'starting provisioning...',
            COMPLETE: 'provision completed',
            ERROR: 'provision failed',
            SUCCESS: 'provision successful',
        },
        UPLOAD_ONE_FILE: {
            SUCCESS: 'one file uploaded successfully',
            ERROR: 'error while uploading one file'
        },
        GET_ONE_FILE_INLINE: {
            SUCCESS: 'file recieved successfully',
            ERROR: 'error while receiving file',
            ERROR_TOO_LARGE: 'file too large'
        },
        GET_ONE_FILE_STREAM: {
            SUCCESS: 'file recieved successfully',
            ERROR: 'error while receiving file',
            ERROR_TOO_LARGE: 'file too large',
            ERROR_STREAM_SIZE_NOT_MATCHING_HEADER: 'streamsize not matching file size',
            ERROR_DEBUG_PATH_NOT_AVAILABLE: 'debug path is not found'
        },
        CREATE_ONE_FILE_FROM_STREAM: {
            SUCCESS: 'one file created successfully from stream',
            ERROR: 'error while creating one file from stream',
            ERROR_CONTENT_TOO_LARGE: 'content too large',
            ERROR_STREAM_SIZE_NOT_AVAILABLE: 'streamsize not available in header',
            ERROR_PATH_NOT_AVAILABLE: 'path is not available',
            ERROR_STREAM_SIZE_NOT_MATCHING_HEADER: 'streamsize not matching file size',
            ERROR_DEBUG_PATH_NOT_AVAILABLE: 'debug path is not found'
        },
        CREATE_ONE_FILE: {
            SUCCESS: 'one file created successfully',
            ERROR: 'error while creating one file',
            ERROR_CONTENT_TOO_LARGE: 'content too large',
            ERROR_PATH_NOT_AVAILABLE: 'path is not available',
        },
        DELETE_ONE_FILE: {
            SUCCESS: 'one file deleted successfully',
            ERROR: 'error while deleting one file'
        },
        MAXIMUM: {
            FILE_SIZE: 'file size is larger than allowed file size'
        }
    }
};