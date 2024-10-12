module.exports = {
    createOneWithVideo: createOneWithVideo,
    getOneById: getOneById,
    startPostSession: startPostSession,
    updateGameVideoById: updateGameVideoById,
    updateReviewSelectionById: updateReviewSelectionById,
    updateReviewPostById: updateReviewPostById,
    updateFavById: updateFavById,
    search: search,
    searchCount: searchCount,
    usageReport: usageReport,
    usageCount: usageCount,
    getPostContent: getPostContent,
    deleteOneById: deleteOneById,
    endPostSession: endPostSession
};

const CommonValidator = require('../../../common/validate/validator');
const CommonConstants = require('../../../common/constant/constant');
const To = require('../../../common/to/to');
const RejectData = require('../../../common/response/reject-data');
const Constants = require('../../constant/constant');
const CustomConstants = require('../../custom/badminton/constant/custom-constant');
const PostService = require('../services/post');
const UserService = require('../services/user');
const ResolveData = require('../../../common/response/resolve-data');
const Config = require('../../config/config');
const SettingsMap = require('../../../common/wrappers/bootstrap/settings-map');
const SettingsKeysCommon = require('../../../common/setting/keys');
const SettingsKeysAssetMgmt = require('../../setting/keys');
const CommonJWTHelper = require('../../../common/jwt/helpers/jwt');
const CourtHelper = require('../helpers/court');

require('dotenv').config();
const { PassThrough } = require('stream');
var unzipper = require('unzipper');
const fs = require('fs');
const TransactionSession = require('../services/transaction-session');

const Util = require('util');
const Stream = require('stream');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');
const pathToFfmpeg = require('ffmpeg-static');

const Finished = Util.promisify(Stream.finished);
axios.interceptors.response.use(
    async (response) => {
        return response;
    },
    async (err) => {
        if (err.response) {
            if (err.response.headers.hasContentType('application/json') &&
                err.response.data instanceof Stream.Readable) {
                let data = '';

                await Finished(
                    err.response.data.on('data', (chunk) => {
                        data += chunk.toString();
                    })
                );
                err.response.data = JSON.parse(data);
                err.response.config.responseType = 'json';
            }
        }
        throw err;
    });
/**
* strip off irrelevant fields
* @param {*} user json
*/
async function stripOffFields(user, stripOffToken) {
    let includeAllFieldsInRestResponse = SettingsMap.get(SettingsKeysCommon.COMMON.TEST.INCLUDE_ALL_FIELDS_IN_REST_RESPONSE);

    let postClone = JSON.parse(JSON.stringify(user));

    if (!includeAllFieldsInRestResponse) {
        if (postClone.identifier) {
            delete postClone['identifier'];
        }
        if (postClone.phone) {
            delete postClone['phone'];
        }
        if (postClone.email) {
            delete postClone['email'];
        }
        if (postClone.role) {
            delete postClone['role'];
        }
        if (postClone.state) {
            delete postClone['state'];
        }
        if (postClone.activityDetails) {
            delete postClone['activityDetails'];
        }
        if (postClone.profileData) {
            delete postClone['profileData'];
        }
        if (stripOffToken) {
            if (postClone.token) {
                delete postClone['token'];
            }
        }
    }
    return stripOffUnnecessaryFields(postClone);
}

/**
* strip off unnecessary fields
* @param {*} user json
*/
async function stripOffUnnecessaryFields(post) {
    let postClone = JSON.parse(JSON.stringify(post));

    if ((null == postClone.createdBy) || postClone.createdBy) {
        delete postClone['createdBy'];
    }
    if ((null == postClone.updatedBy) || postClone.updatedBy) {
        delete postClone['updatedBy'];
    }
    if (postClone.createdAt) {
        delete postClone['createdAt'];
    }
    if (postClone.updatedAt) {
        delete postClone['updatedAt'];
    }
    if ((postClone.__v == 0) || postClone.__v) {
        delete postClone['__v'];
    }
    return Promise.resolve(postClone);
}
function handleAxiosError(axiosError, message) {
    var rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.UNKNOWN.CODE,
        message,
        CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
        null);

    if (axiosError.response) {
        if (axiosError.response.data) {
            rejectObject.setCode(axiosError.response.data.code);
            rejectObject.appendMessage(axiosError.response.data.message);
            rejectObject.setType(axiosError.response.data.type);
        }
    } else if (axiosError.request) {
        rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE);
        rejectObject.appendMessage(axiosError.code);
        rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.SYSTEM);
        rejectObject.setData(axiosError.request.cause);
    } else if (axiosError.message) {
        rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE);
        rejectObject.appendMessage(axiosError.message);
        rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.SYSTEM);
    } else {
        //Nothing to do 
    }
    return rejectObject.jsonObject();
}

async function createThumbnailAndDeleteVideo(videoPath, videoFileName, tnFileName) {
    return new Promise((resolve, reject) => {
        let videoFileExtn = videoFileName.substring(videoFileName.lastIndexOf('.') + 1);
        ffmpeg()
            .setFfmpegPath(pathToFfmpeg)
            .input(videoPath + videoFileName)
            .seek(3)
            .frames(1)
            .size('360x?')
            .saveToFile(videoPath + tnFileName)
            .on('progress', (progress) => {
                if (progress.percent) {
                    //console.log(`Processing: ${Math.floor(progress.percent)}% done`);
                }
            })
            .on('end', () => {
                //console.log('FFmpeg has finished.');
                fs.unlinkSync(videoPath + videoFileName);
                return resolve('created thumbnail and deleted video');
            })
            .on('error', (error) => {
                console.error(error);
                fs.unlinkSync(videoPath + videoFileName);
                return reject(error);
            })
            .on('close', () => {
                //console.log('FFmpeg DONE');
            });
    });
}

/**
* Create one user
* @param {*} caller 
* @param {*} type 
* @param {*} file 
* @param {*} state 
* @param {*} flags 
*/
async function createOneWithVideo(inputStream, caller, streamSize, fileName, flags) {
    let error, result;
    let tnFileName = fileName.substring(0, (fileName.lastIndexOf('.'))+1) + 'jpeg';

    var rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
        Constants.ASSETMGMT.POST.CREATE_ONE.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
        null
    );

    var resolveObject = new ResolveData(
        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
        Constants.ASSETMGMT.POST.CREATE_ONE.SUCCESS,
        null
    );

    try {
        if (!flags) {
            flags = {};
        }
        let post = {};
        post.poster = caller._id;
        post.updatedBy = caller._id;
        post.type = 'game-review';

        if (caller.role === CustomConstants.CUSTOM_USER_ROLE_NAMES_BADMINTON.PLAYER) {
            post.game = [];
            let gameVideo = {};
            let allowedMaxSize = SettingsMap.get(
                CommonConstants.COMMON.APP_MICRO_SERVICES.ASSETMGMT.CODE + '.' +
                Constants.ASSETMGMT.POST.CODE + '.' +
                Constants.ASSETMGMT.POST.TYPES.find(obj => { return obj.CODE === post.type; }).SUBTYPES.find(obj => { return obj.CODE === 'game'; }).MAX_ALLOWED_SIZE.PROPERTY);
            let allowedMimeTypes = SettingsMap.get(
                CommonConstants.COMMON.APP_MICRO_SERVICES.ASSETMGMT.CODE + '.' +
                Constants.ASSETMGMT.POST.CODE + '.' +
                Constants.ASSETMGMT.POST.TYPES.find(obj => { return obj.CODE === post.type; }).SUBTYPES.find(obj => { return obj.CODE === 'game'; }).ALLOWED_MIME_TYPES.PROPERTY);

            if (allowedMaxSize >= streamSize) {
                let fileExtn = fileName.substring(fileName.lastIndexOf('.') + 1);
                let fileMimeType = CommonValidator.getMimeTypeFromExtension(fileExtn);

                if (CommonValidator.isAllowedMimeType(fileMimeType, allowedMimeTypes)) {
                    var path = Config.DEPLOYMENT.ENVIRONMENT + '/' +
                        post.poster + '/' +
                        post.type + '/' + 
                        fileName;

                    var tnPath = Config.DEPLOYMENT.ENVIRONMENT + '/' +
                        post.poster + '/' +
                        post.type + '/' +
                        tnFileName;

                    const FileServerUrl = Config.FILE.URL + Config.FILE.STREAM;

                    let config = {
                        headers: {
                            destinationfilepath: path,
                            streamsize: streamSize
                        }
                    };

                    ///////////////////////
                    let consolidatedUploadSizeMon = 0;
                    const monitor = new PassThrough();
                    monitor.on('error', function (err) {
                        //console.log('monitor stream error', err);
                    });
                    monitor.on('drain', function () {
                        //console.log('monitor stream drain');
                    });
                    monitor.on('unpipe', function () {
                        //console.log('monitor stream unpipe');
                    });
                    monitor.on('close', function () {
                        //console.log('monitor stream close');
                    });
                    monitor.on('data', (chunk) => {
                        consolidatedUploadSizeMon += chunk.length;
                        //console.log('heap mem usage - ' + process.memoryUsage().heapUsed);
                        //console.log('fileserver; monitor stream progress = ' + consolidatedUploadSizeMon * 100 / req.headers.streamsize);
                    });
                    monitor.on('end', () => {
                        //console.log('monitor stream end');
                    });
                    monitor.on('finish', () => {
                        //console.log('monitor stream finish');
                    });
                    ///////////////////////

                    error = result = null;
                    let inputStream1 = inputStream.pipe(monitor);

                    var writeStreamForThumbnail = null;
                    writeStreamForThumbnail = fs.createWriteStream('./thumbnail/' + fileName);
                    monitor.pipe(writeStreamForThumbnail);

                    [error, result] = await To(axios.put(FileServerUrl, inputStream1, config));
                    if (writeStreamForThumbnail) {
                        writeStreamForThumbnail.end();
                    }
                    if (result && result.data) {
                        gameVideo.path = path;
                        error = result = null;
                        [error, result] = await To(createThumbnailAndDeleteVideo('./thumbnail/',
                            fileName,
                            tnFileName));

                        if (result) {
                            error = result = null;
                            let stats = fs.statSync('./thumbnail/' + tnFileName);
                            config = {
                                headers: {
                                    destinationfilepath: tnPath,
                                    streamsize: stats.size
                                }
                            };

                            [error, result] = await To(axios.put(FileServerUrl, fs.createReadStream('./thumbnail/' + tnFileName), config));
                            fs.unlinkSync('./thumbnail/' + tnFileName);
                            if (result && result.data) {
                                gameVideo.tnPath = tnPath;
                            }
                        }
                        post.game.push(gameVideo);
                        post.state = Constants.ASSETMGMT.POST.STATES.CREATED;
                        // Create
                        error = result = null;
                        [error, result] = await To(PostService.createOne(post));
                        if (CommonValidator.isSuccessResponse(result)) {
                            resolveObject.setData(result.data);
                            return Promise.resolve(resolveObject.jsonObject());
                        } else {
                            rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
                            rejectObject.appendMessage(error.message);
                            rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                            rejectObject.setDetails(error);
                            return Promise.reject(rejectObject.jsonObject());
                        }
                    } else {
                        return Promise.reject(handleAxiosError(error, Constants.ASSETMGMT.POST.CREATE_ONE.ERROR));
                    }
                } else {
                    if (writeStreamForThumbnail) {
                        writeStreamForThumbnail.end();
                    }
                    rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
                    rejectObject.appendMessage(Constants.ASSETMGMT.POST.CREATE_ONE.ERROR_MIME_TYPE_NOT_ALLOWED);
                    rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                    rejectObject.setDetails(error);
                    return Promise.reject(rejectObject.jsonObject());
                }
            } else {
                rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
                rejectObject.appendMessage(Constants.ASSETMGMT.POST.CREATE_ONE.ERROR_TOO_LARGE);
                rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                rejectObject.setDetails(error);
                return Promise.reject(rejectObject.jsonObject());
            }
        } else {
            rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
            rejectObject.appendMessage(Constants.ASSETMGMT.POST.CREATE_ONE.ERROR_NOT_AUTHORIZED);
            rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.POST.CREATE_ONE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);
        return Promise.reject(rejectObject.jsonObject());
    }
}

/**
* Create one user
* @param {*} _id
* @param {*} flags 
*/
async function startPostSession(caller, academyName, courtName, sessionName, flags) {
    let error, result;

    var rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
        Constants.ASSETMGMT.POST.START_ONE_POST_SESSION.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
        null
    );

    var resolveObject = new ResolveData(
        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
        Constants.ASSETMGMT.POST.START_ONE_POST_SESSION.SUCCESS,
        null
    );

    try {
        if (!flags) {
            flags = {};
        }
        let post = {};
        post.poster = caller._id;
        post.updatedBy = caller._id;
        post.type = 'game-review';
        post.name = sessionName;

        if (caller.role === CustomConstants.CUSTOM_USER_ROLE_NAMES_BADMINTON.PLAYER) {
            post.state = Constants.ASSETMGMT.POST.STATES.SESSION_NOTIFIED;
            // Create session token
            let jwtError, jwtResult;
            let expiryDuration = SettingsMap.get(SettingsKeysCommon.COMMON.JWT.EXPIRY_DURATION_SECONDS) * 1000; //TODOCORRECTION
            [jwtError, jwtResult] = await To(CommonJWTHelper.generateJWT(caller._id,
                [CustomConstants.CUSTOM_USER_ROLE_NAMES_BADMINTON.PLAYER],
                'sso token for post session', //TODOCORRECTION
                expiryDuration
            ));
            if (CommonValidator.isSuccessResponseAndNonEmptyData(jwtResult)) {
                post.session = {};
                error = result = null;
                let academyCourt = {};
                academyCourt.name = academyName;
                academyCourt.court = courtName;
                [error, result] = await To(CourtHelper.getOne(academyCourt));
                if (CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
                    post.session.allowedCameras = result.data.cameras;
                } else {
                    rejectObject.setMessage(Constants.ASSETMGMT.POST.START_ONE_POST_SESSION.ERROR_ACADEMY_OR_COURT_NOT_FOUND);
                    rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.SYSTEM);
                    return Promise.reject(rejectObject.jsonObject());
                }
                post.session.token = {};
                post.session.token.token = jwtResult.data.token;
                post.session.token.expiry = jwtResult.data.expiry;
            } else {
                rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE);
                rejectObject.appendMessage(jwtError.message);
                rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.SYSTEM);
                return Promise.reject(rejectObject.jsonObject());
            }

            error = result = null;
            //console.log(post);
            [error, result] = await To(PostService.createOne(post));
            if (CommonValidator.isSuccessResponse(result)) {
                resolveObject.setData(result.data);
                return Promise.resolve(resolveObject.jsonObject());
            } else {
                rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
                rejectObject.appendMessage(error.message);
                rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                rejectObject.setDetails(error);
                return Promise.reject(rejectObject.jsonObject());
            }
        } else {
            rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
            rejectObject.appendMessage(Constants.ASSETMGMT.POST.START_ONE_POST_SESSION.ERROR_NOT_AUTHORIZED);
            rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.POST.START_ONE_POST_SESSION.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);
        return Promise.reject(rejectObject.jsonObject());
    }
}

/**
 * Get one user by id
 * @param {*} postId string
 * @param {*} flags json
 */
async function getOneById(postId, flags) {
    try {
        // Initialize
        let error, result;

        // Create
        [error, result] = await To(PostService.getOneById(postId));
        if (error) {
            return Promise.reject(error);
        }
        if (result) {
            let strippedPost = null;
            error = null;
            [error, strippedPost] = await To(stripOffUnnecessaryFields(result.data));
            if (strippedPost) {
                var resolveObject = new ResolveData(
                    CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
                    Constants.ASSETMGMT.POST.GET_ONE_BY_ID.SUCCESS,
                    strippedPost
                );
                return Promise.resolve(resolveObject.jsonObject());

            } else {
                rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE);
                rejectObject.appendMessage(Constants.ASSETMGMT.POST.GENERIC.PREPARE_RESPONSE_DATA.ERROR);
                rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN);
                return Promise.reject(rejectObject.jsonObject());
            }
        }
    } catch (e) {
        var rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.POST.GET_ONE_BY_ID.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);

        return Promise.reject(rejectObject.jsonObject());
    }
}

/**
* Create one post
* @param {*} caller 
* @param {*} type 
* @param {*} file 
* @param {*} flags 
*/
async function updateGameVideoById(inputStream, caller, existingPost, streamSize, fileName, cameraName, flags) {

    let error, result;
    let tnFileName = fileName.substring(0, (fileName.lastIndexOf('.')) + 1) + 'jpeg';

    var rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
        Constants.ASSETMGMT.POST.ADD_GAME_VIDEO_TO_POST_SESSION.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
        null
    );

    var resolveObject = new ResolveData(
        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
        Constants.ASSETMGMT.POST.ADD_GAME_VIDEO_TO_POST_SESSION.SUCCESS,
        null
    );

    try {
        if (!flags) {
            flags = {};
        }
        let post = {};
        if (caller.role === CustomConstants.CUSTOM_USER_ROLE_NAMES_BADMINTON.PLAYER) {
            let gameVideo = {};
            let allowedMaxSize = SettingsMap.get(
                CommonConstants.COMMON.APP_MICRO_SERVICES.ASSETMGMT.CODE + '.' +
                Constants.ASSETMGMT.POST.CODE + '.' +
                Constants.ASSETMGMT.POST.TYPES.find(obj => { return obj.CODE === existingPost.type; }).SUBTYPES.find(obj => { return obj.CODE === 'game'; }).MAX_ALLOWED_SIZE.PROPERTY);
            let allowedMimeTypes = SettingsMap.get(
                CommonConstants.COMMON.APP_MICRO_SERVICES.ASSETMGMT.CODE + '.' +
                Constants.ASSETMGMT.POST.CODE + '.' +
                Constants.ASSETMGMT.POST.TYPES.find(obj => { return obj.CODE === existingPost.type; }).SUBTYPES.find(obj => { return obj.CODE === 'game'; }).ALLOWED_MIME_TYPES.PROPERTY);

            if (allowedMaxSize >= streamSize) {
                let fileExtn = fileName.substring(fileName.lastIndexOf('.') + 1);
                let fileMimeType = CommonValidator.getMimeTypeFromExtension(fileExtn);

                if (CommonValidator.isAllowedMimeType(fileMimeType, allowedMimeTypes)) {
                    var path = Config.DEPLOYMENT.ENVIRONMENT + '/' +
                        existingPost.poster + '/' +
                        existingPost.type + '/' +
                        fileName;

                    var tnPath = Config.DEPLOYMENT.ENVIRONMENT + '/' +
                        existingPost.poster + '/' +
                        existingPost.type + '/' +
                        tnFileName;

                    const FileServerUrl = Config.FILE.URL + Config.FILE.STREAM;

                    let config = {
                        headers: {
                            destinationfilepath: path,
                            streamsize: streamSize
                        }
                    };

                    ///////////////////////
                    let consolidatedUploadSizeMon = 0;
                    const monitor = new PassThrough();
                    monitor.on('error', function (err) {
                        //console.log('monitor stream error', err);
                    });
                    monitor.on('drain', function () {
                        //console.log('monitor stream drain');
                    });
                    monitor.on('unpipe', function () {
                        //console.log('monitor stream unpipe');
                    });
                    monitor.on('close', function () {
                        //console.log('monitor stream close');
                    });
                    monitor.on('data', (chunk) => {
                        consolidatedUploadSizeMon += chunk.length;
                        //console.log('heap mem usage - ' + process.memoryUsage().heapUsed);
                        //console.log('fileserver; monitor stream progress = ' + consolidatedUploadSizeMon * 100 / req.headers.streamsize);
                    });
                    monitor.on('end', () => {
                        //console.log('monitor stream end');
                    });
                    monitor.on('finish', () => {
                        //console.log('monitor stream finish');
                    });
                    ///////////////////////

                    error = result = null;
                    let inputStream1 = inputStream.pipe(monitor);

                    var writeStreamForThumbnail = null;
                    writeStreamForThumbnail = fs.createWriteStream('./thumbnail/' + fileName);
                    monitor.pipe(writeStreamForThumbnail);

                    [error, result] = await To(axios.put(FileServerUrl, inputStream1, config));
                    if (writeStreamForThumbnail) {
                        writeStreamForThumbnail.end();
                    }
                    if (result && result.data) {
                        gameVideo.path = path;
                        error = result = null;
                        [error, result] = await To(createThumbnailAndDeleteVideo('./thumbnail/',
                            fileName,
                            tnFileName));

                        if (result) {
                            error = result = null;
                            let stats = fs.statSync('./thumbnail/' + tnFileName);
                            config = {
                                headers: {
                                    destinationfilepath: tnPath,
                                    streamsize: stats.size
                                }
                            };

                            [error, result] = await To(axios.put(FileServerUrl, fs.createReadStream('./thumbnail/' + tnFileName), config));
                            fs.unlinkSync('./thumbnail/' + tnFileName);
                            if (result && result.data) {
                                gameVideo.tnPath = tnPath;
                            }
                        }
                        //console.log(post);
                        if (cameraName) {
                            gameVideo.cameraName = cameraName;  
                        }
                        post.updatedBy = caller._id;

                        if (existingPost.session.allowedCameras.length === 1) {
                            post.state = Constants.ASSETMGMT.POST.STATES.CREATED;
                            post.session = {};
                            cameraName = null;
                        }
                        // Update
                        error = result = null;
                        [error, result] = await To(PostService.updateOneById(existingPost._id, post, gameVideo, null, null, cameraName, null));
                        if (CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
                            let strippedPost = null;
                            let error1 = null;
                            [error1, strippedPost] = await To(stripOffUnnecessaryFields(result.data));
                            if (strippedPost) {
                                if (strippedPost.session) {
                                    delete strippedPost['session'];
                                }
                                if (strippedPost.game) {
                                    delete strippedPost['game'];
                                }
                                resolveObject.setData(strippedPost);
                                return Promise.resolve(resolveObject.jsonObject());
                            } else {
                                rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
                                rejectObject.appendMessage(error1.message);
                                rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                                rejectObject.setDetails(error1);
                                return Promise.reject(rejectObject.jsonObject());
                            }                            
                        } else {
                            rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
                            rejectObject.appendMessage(error.message);
                            rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                            rejectObject.setDetails(error);
                            return Promise.reject(rejectObject.jsonObject());
                        }
                    } else {
                        return Promise.reject(handleAxiosError(error, Constants.ASSETMGMT.POST.ADD_GAME_VIDEO_TO_POST_SESSION.ERROR));
                    }
                } else {
                    if (writeStreamForThumbnail) {
                        writeStreamForThumbnail.end();
                    }
                    rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
                    rejectObject.appendMessage(Constants.ASSETMGMT.POST.ADD_GAME_VIDEO_TO_POST_SESSION.ERROR_MIME_TYPE_NOT_ALLOWED);
                    rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                    rejectObject.setDetails(error);
                    return Promise.reject(rejectObject.jsonObject());
                }
            } else {
                rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
                rejectObject.appendMessage(Constants.ASSETMGMT.POST.ADD_GAME_VIDEO_TO_POST_SESSION.ERROR_TOO_LARGE);
                rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                rejectObject.setDetails(error);
                return Promise.reject(rejectObject.jsonObject());
            }
        } else {
            rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
            rejectObject.appendMessage(Constants.ASSETMGMT.POST.ADD_GAME_VIDEO_TO_POST_SESSION.ERROR_NOT_AUTHORIZED);
            rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {
        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.POST.ADD_GAME_VIDEO_TO_POST_SESSION.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);
        return Promise.reject(rejectObject.jsonObject());
    }
}

/**
* Create one post
* @param {*} caller 
* @param {*} type 
* @param {*} file 
* @param {*} flags 
*/
async function updateReviewPostById(inputStream, caller, file, gamePostId, streamSize, fileName, flags, reviewIndex) {
    let error, result;
    var rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
        Constants.ASSETMGMT.POST.CREATE_ONE.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
        null
    );

    var resolveObject = new ResolveData(
        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
        Constants.ASSETMGMT.POST.CREATE_ONE.SUCCESS,
        null
    );

    try {
        if (!flags) {
            flags = {};
        }

        let existingPost = {};
        [error, result] = await To(PostService.getOneById(gamePostId, flags));
        if (CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
            existingPost = result.data;
            let post = {};

            if ((caller.role === CustomConstants.CUSTOM_USER_ROLE_NAMES_BADMINTON.REVIEWER)) {
                post.review = {};

                let allowedMaxSize = SettingsMap.get(
                    CommonConstants.COMMON.APP_MICRO_SERVICES.ASSETMGMT.CODE + '.' +
                    Constants.ASSETMGMT.POST.CODE + '.' +
                    Constants.ASSETMGMT.POST.TYPES.find(obj => { return obj.CODE === 'game-review'; }).SUBTYPES.find(obj => { return obj.CODE === 'review'; }).MAX_ALLOWED_SIZE.PROPERTY);
                let allowedMimeTypes = SettingsMap.get(
                    CommonConstants.COMMON.APP_MICRO_SERVICES.ASSETMGMT.CODE + '.' +
                    Constants.ASSETMGMT.POST.CODE + '.' +
                    Constants.ASSETMGMT.POST.TYPES.find(obj => { return obj.CODE === 'game-review'; }).SUBTYPES.find(obj => { return obj.CODE === 'review'; }).ALLOWED_MIME_TYPES.PROPERTY);

                if (allowedMaxSize >= streamSize) {
                    let fileExtn = fileName.split('.')[1];
                    let fileMimeType = CommonValidator.getMimeTypeFromExtension(fileExtn);
                    if (CommonValidator.isAllowedMimeType(fileMimeType, allowedMimeTypes)) {

                        const FileServerUrl = Config.FILE.URL + Config.FILE.STREAM;
                        var path, config;
                        path = Config.DEPLOYMENT.ENVIRONMENT + '/' +
                            existingPost.poster + '/' +
                            existingPost.type + '/' +
                            existingPost._id + '/';

                        ///////////////////////
                        let processingFileName, processingFileSize;
                        let consolidatedUploadSizeMon = 0;
                        const monitor = new PassThrough();
                        monitor.on('error', function (err) {
                            //console.log('monitor stream error - ', processingFileName + ' - ', err);
                        });
                        monitor.on('drain', function () {
                            //console.log('monitor stream drain - ', processingFileName);
                        });
                        monitor.on('unpipe', function () {
                            //console.log('monitor stream unpipe - ', processingFileName);
                        });
                        monitor.on('close', function () {
                            //console.log('monitor stream close - ', processingFileName);
                        });
                        monitor.on('data', (chunk) => {
                            consolidatedUploadSizeMon += chunk.length;
                            //console.log('heap mem usage - ' + process.memoryUsage().heapUsed);
                            //console.log('fileserver; monitor stream progress = ' + consolidatedUploadSizeMon * 100 / processingFileSize + ' - ', processingFileName);
                        });
                        monitor.on('end', () => {
                            //console.log('monitor stream end - ', processingFileName);
                        });
                        monitor.on('finish', () => {
                            //console.log('monitor stream finish - ', processingFileName);
                        });
                        ///////////////////////


                        //check if incoming stream is the zip file
                        //TODO1000 improve to include all archives, remove hardcoding
                        if (fileExtn === 'zip') {

                            const zip = inputStream.pipe(unzipper.Parse({ forceStream: true }));

                            for await (const entry of zip) {
                                processingFileName = entry.path;
                                processingFileSize = entry.vars.uncompressedSize; // There is also compressedSize;
                                const type = entry.type; // 'Directory' or 'File'
                                //entry.autodrain();
                                //entry.pipe(fs.createWriteStream('./output/' + fileName));

                                if (type === 'File') {
                                    //send the file to file server
                                    config = {
                                        headers: {
                                            destinationfilepath: path + processingFileName,
                                            streamsize: processingFileSize
                                        }
                                    };
                                    error = result = null;
                                    [error, result] = await To(axios.put(FileServerUrl, entry, config));
                                    if (error) {
                                        unzipper.destroy();
                                        rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
                                        rejectObject.appendMessage(error.message);
                                        rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                                        rejectObject.setDetails(error);
                                        return Promise.reject(rejectObject.jsonObject());
                                    }
                                } else {
                                    unzipper.destroy();
                                    rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
                                    rejectObject.appendMessage(Constants.ASSETMGMT.POST.CREATE_ONE.ERROR_UNSUPPORTED_ZIP);
                                    rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                                    rejectObject.setDetails(error);
                                    return Promise.reject(rejectObject.jsonObject());
                                }


                            }
                            //send each file to file server
                            //await req.pipe(unzipper.Parse())
                            //    .on('entry', function (entry) {
                            //        const fileName = entry.path;
                            //        const type = entry.type; // 'Directory' or 'File'
                            //        const size = entry.vars.uncompressedSize; // There is also compressedSize;
                            //        console.log(fileName, type, size);
                            //        //entry.autodrain();

                            //        if (type === 'File') {
                            //            //send the file to file server
                            //            config = {
                            //                headers: {
                            //                    destinationfilepath: path + fileName,
                            //                    streamsize: size
                            //                }
                            //            };
                            //            axios.put(FileServerUrl, entry.pipe(monitor), config);
                            //        //    error = result = null;
                            //        //    [error, result] = await To(axios.put(FileServerUrl, entry.pipe(monitor), config));
                            //        //    if (error) {
                            //        //        unzipper.destroy();
                            //        //        rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
                            //        //        rejectObject.appendMessage(error.message);
                            //        //        rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                            //        //        rejectObject.setDetails(error);
                            //        //        return Promise.reject(rejectObject.jsonObject());
                            //        //    }
                            //        } else {
                            //            unzipper.destroy();
                            //            rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
                            //            rejectObject.appendMessage(Constants.ASSETMGMT.POST.CREATE_ONE.ERROR_UNSUPPORTED_ZIP);
                            //            rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                            //            rejectObject.setDetails(error);
                            //            return Promise.reject(rejectObject.jsonObject());
                            //        }


                            //        //entry.pipe(fs.createWriteStream('./output/' + fileName));
                            //    })
                            //    .on('finish', function () {
                            //        //Extraction done, you can do any cleanup or navigation here. 
                            //        console.log('finish');
                            //    })
                            //    .on('error', function () {
                            //        //Error. 
                            //        console.log('error');
                            //    });

                        } else {
                            //send the file to file server
                            config = {
                                headers: {
                                    destinationfilepath: path + fileName,
                                    streamsize: streamSize
                                }
                            };

                            error = result = null;
                            [error, result] = await To(axios.put(FileServerUrl, inputStream.pipe(monitor), config));

                        }

                        if (result && result.data) {
                            post.review.path = path;
                            post.reviewIndex = {};
                            if (reviewIndex) {
                                post.reviewIndex = reviewIndex;
                            }
                            if ((post.review && post.review.path) &&
                                (post.reviewIndex && CommonValidator.isNonEmptyObject(post.reviewIndex))) {
                                post.state = Constants.ASSETMGMT.POST.STATES.REVIEWED;
                                post.reviewCompleteTime = Date.now();
                            }

                            // Update
                            error = result = null;
                            [error, result] = await To(PostService.updateOneById(existingPost._id, post));
                            if (CommonValidator.isSuccessResponse(result)) {
                                resolveObject.setData(result);
                                return Promise.resolve(resolveObject.jsonObject());
                            } else {
                                rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
                                rejectObject.appendMessage(error.message);
                                rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                                rejectObject.setDetails(error);
                                return Promise.reject(rejectObject.jsonObject());
                            }
                        } else {
                            return Promise.reject(handleAxiosError(error, Constants.ASSETMGMT.POST.CREATE_ONE.ERROR));
                        }
                    } else {
                        rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
                        rejectObject.appendMessage(Constants.ASSETMGMT.POST.CREATE_ONE.ERROR_MIME_TYPE_NOT_ALLOWED);
                        rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                        rejectObject.setDetails(error);
                        return Promise.reject(rejectObject.jsonObject());
                    }
                } else {
                    rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
                    rejectObject.appendMessage(Constants.ASSETMGMT.POST.CREATE_ONE.ERROR_TOO_LARGE);
                    rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                    rejectObject.setDetails(error);
                    return Promise.reject(rejectObject.jsonObject());
                }
            } else {
                rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
                rejectObject.appendMessage(Constants.ASSETMGMT.POST.CREATE_ONE.ERROR_NOT_AUTHORIZED);
                rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                return Promise.reject(rejectObject.jsonObject());
            }
        } else {
            rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
            rejectObject.appendMessage(Constants.ASSETMGMT.POST.GET_ONE_BY_ID.ERROR);
            rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {

        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.POST.CREATE_ONE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);
        return Promise.reject(rejectObject.jsonObject());
    }
}

/**
* Search
* @param {*} searchData 
*/
async function search(searchData) {
    // Initialize
    let error, result;

    try {
        // Search
        [error, result] = await To(PostService.search(searchData));
        if (error) {
            return Promise.reject(error);
        }

        if (result) {
            return Promise.resolve(result);
        }
    } catch (e) {
        var rejObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.POST.SEARCH.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);

        rejObject.appendMessage(e.message);
        return Promise.reject(rejObject.jsonObject());
    }
}

/**
* Search
* @param {*} searchData 
*/
async function usageReport(searchData) {
    // Initialize
    let error, result;

    try {
        // Search
        [error, result] = await To(PostService.usageReport(searchData));
        if (error) {
            return Promise.reject(error);
        }

        if (result) {
            return Promise.resolve(result);
        }
    } catch (e) {
        var rejObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.POST.USAGE_REPORT.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);

        rejObject.appendMessage(e.message);
        return Promise.reject(rejObject.jsonObject());
    }
}

/**
* Search
* @param {*} searchData 
*/
async function usageCount(searchData) {
    // Initialize
    let error, result;

    try {
        // Search
        [error, result] = await To(PostService.usageCount(searchData));
        if (error) {
            return Promise.reject(error);
        }

        if (result) {
            return Promise.resolve(result);
        }
    } catch (e) {
        var rejObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.POST.USAGE_REPORT.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);

        rejObject.appendMessage(e.message);
        return Promise.reject(rejObject.jsonObject());
    }
}

/**
 * Search count
 * @param {*} searchData 
 */
async function searchCount(searchData) {
    // Initialize
    let error, result;

    try {
        // Data manipulation
        // Search
        [error, result] = await To(PostService.searchCount(searchData));
        if (error) {
            return Promise.reject(error);
        }

        if (result) {
            return Promise.resolve(result);
        }
    } catch (e) {
        var rejObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.POST.SEARCH_COUNT.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejObject.appendMessage(e.message);

        return Promise.reject(rejObject.jsonObject());
    }
}
async function getPostContent(postId, postType, file) {
    var resolveObject = new ResolveData(
        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
        Constants.ASSETMGMT.POST.GET_ONE_BY_ID.SUCCESS,
        null
    );
    var rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
        Constants.ASSETMGMT.POST.GET_ONE_BY_ID.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.DATA,
        null);

    try {
        // Initialize
        let error, result;

        // get one by id
        [error, result] = await To(PostService.getOneById(postId));
        if (error) {
            return Promise.reject(error);
        }
        if (result) {
            let path;

            //TODO1000 remove this hardcoding
            if (postType == 'game') {
                if (!file || (file === '')) {
                    if (CommonValidator.isNonEmptyArray(result.data.game)) {
                        path = result.data.game[0].path;
                    } else {
                        rejectObject.appendMessage(Constants.ASSETMGMT.POST.GET_ONE_BY_ID.ERROR_GAME_NOT_AVAILABLE);
                        return Promise.reject(rejectObject.jsonObject());
                    }
                } else {
                    path = file;
                }
                const fileServerUrl = Config.FILE.URL + Config.FILE.STREAM;

                error = null;
                let response = null;
                try {
                    response = await axios.get(fileServerUrl + '?' + path, { responseType: 'stream' });
                    if (response.headers.get('content-type') === 'application/octet-stream') {
                        resolveObject.setData(
                            {
                                isStream: true,
                                stream: response.data,
                                streamSize: response.headers.streamsize,
                                fileName: response.headers.filename/*,
                                contentType: response.headers.get('content-type')*/
                            }
                        );
                        return Promise.resolve(resolveObject.jsonObject());
                    } else {
                        rejectObject.appendMessage(Constants.ASSETMGMT.POST.GET_ONE_BY_ID.ERROR_STREAM_NOT_AVAILABLE);
                        return Promise.reject(rejectObject.jsonObject());
                    }
                } catch (err) {
                    return Promise.reject(handleAxiosError(err, Constants.ASSETMGMT.POST.GET_ONE_BY_ID.ERROR));
                }
            } else if (postType == 'review') {
                if (!file || (file === '')) {
                    if (result.data.reviewIndex) {
                        resolveObject.setData(JSON.parse(result.data.reviewIndex));
                        return Promise.resolve(resolveObject.jsonObject());
                    } else {
                        rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
                        rejectObject.appendMessage(Constants.ASSETMGMT.POST.GET_ONE_BY_ID.ERROR_REVIEW_NOT_AVAILABLE);
                        return Promise.reject(rejectObject.jsonObject());
                    }
                } else {
                    path = result.data.review.path + file;
                    const fileServerUrl = Config.FILE.URL + Config.FILE.STREAM;

                    error = null;
                    let response = null;
                    try {
                        response = await axios.get(fileServerUrl + '?' + path, { responseType: 'stream' });
                        if (response.headers.get('content-type') === 'application/octet-stream') {
                            resolveObject.setData(
                                {
                                    isStream: true,
                                    stream: response.data,
                                    streamSize: response.headers.streamsize,
                                    fileName: response.headers.filename/*,
                                    contentType: response.headers.get('content-type')*/
                                }
                            );
                            return Promise.resolve(resolveObject.jsonObject());
                        } else {
                            rejectObject.appendMessage(Constants.ASSETMGMT.POST.GET_ONE_BY_ID.ERROR_NO_STREAM);
                            return Promise.reject(rejectObject.jsonObject());
                        }
                    } catch (err) {
                        return Promise.reject(handleAxiosError(err, Constants.ASSETMGMT.POST.GET_ONE_BY_ID.ERROR));
                    }
                }

            } else {
                rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
                rejectObject.appendMessage(Constants.ASSETMGMT.POST.GET_ONE_BY_ID.ERROR_POST_TYPE_UNKNOWN);
                return Promise.reject(rejectObject.jsonObject());
            }
        }
    } catch (e) {
        rejectObject.appendMessage(e.message);
        rejectObject.setDetails(e);
        return Promise.reject(rejectObject.jsonObject());
    }
}


/**
* update one post
* @param {*} gamePostId 
* @param {*} reviewIndex 
*/
async function updateReviewSelectionById(caller, gamePostId, reviewIndex, flags) {
    let error, result;
    var rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
        Constants.ASSETMGMT.POST.UPDATE_ONE.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
        null
    );

    var resolveObject = new ResolveData(
        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
        Constants.ASSETMGMT.POST.UPDATE_ONE.SUCCESS,
        null
    );

    try {
        if (!flags) {
            flags = {};
        }
        let postLimitCount = SettingsMap.get(SettingsKeysAssetMgmt.ASSETMGMT.POST.REVIEW_LIMIT_COUNT);
        let postLimitWindowDuration = SettingsMap.get(SettingsKeysAssetMgmt.ASSETMGMT.POST.REVIEW_LIMIT_WINDOW_DURATION) * 1000;

        let existingPost = {};
        [error, result] = await To(PostService.getOneById(gamePostId, flags));
        if (CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
            existingPost = result.data;
            let post = {};
            if ((caller.role === 'player') && (caller._id.equals(existingPost.poster))) {
                post.updatedBy = caller._id;
                post.reviewIndex = {};
                if (reviewIndex) {
                    //Exit early in case cannot do
                    if (!caller.profileData.membershipProfile) {
                        rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
                        rejectObject.setMessage(Constants.ASSETMGMT.POST.UPDATE_ONE.ERROR_MEMBERSHIP_NOT_FOUND);
                        rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                        return Promise.reject(rejectObject.jsonObject());
                    } else if (caller.profileData.membershipProfile.remainingReviews === 0) {
                        rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
                        rejectObject.setMessage(Constants.ASSETMGMT.POST.UPDATE_ONE.ERROR_MEMBERSHIP_NO_REVIEW_CREDITS);
                        rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                        return Promise.reject(rejectObject.jsonObject());
                    }

                    if (caller.profileData.membershipProfile.reviewRequestedAt) {
                        let reviewsRequestedInWindowDuration = 0;
                        caller.profileData.membershipProfile.reviewRequestedAt.forEach(reqTime => {
                            if (Date.now() < reqTime + postLimitWindowDuration) {
                                reviewsRequestedInWindowDuration++;
                            }
                        });
                        if (reviewsRequestedInWindowDuration >= postLimitCount) {
                            rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
                            rejectObject.setMessage(Constants.ASSETMGMT.POST.UPDATE_ONE.ERROR_EXHAUSTED_REVIEWS_FOR_PERIOD);
                            rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                            return Promise.reject(rejectObject.jsonObject());
                        }
                    } else {
                        rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
                        rejectObject.setMessage(Constants.ASSETMGMT.POST.UPDATE_ONE.ERROR_MEMBERSHIP_NOT_FOUND);
                        rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.SYSTEM);
                        return Promise.reject(rejectObject.jsonObject());
                    }

                    post.reviewIndex = reviewIndex;
                    let updateUser = {};
                    updateUser.profileData = {};

                    post.reviewRequestTime = Date.now();
                    post.state = Constants.ASSETMGMT.POST.STATES.REVIEW_REQUESTED;
                }

                //transaction op
                const ts = await TransactionSession.startTransactionSession();
                error = result = null;
                [error, result] = await To(PostService.updateOneById(existingPost._id, post));
                if (CommonValidator.isSuccessResponse(result)) {
                    resolveObject.setData(result.data);
                    let error1, result1;
                    if (caller.profileData &&
                        caller.profileData.membershipProfile) {
                        if (caller.profileData.membershipProfile.remainingReviews > 0) {
                            let userToUpdate = {};
                            userToUpdate.profileData = {};
                            userToUpdate.profileData.membershipProfile = {};

                            if (caller.profileData.membershipProfile.reviewRequestedAt) {
                                let reviewsRequestedInWindowDuration = 0;
                                caller.profileData.membershipProfile.reviewRequestedAt.forEach(reqTime => {
                                    if (Date.now() < reqTime + postLimitWindowDuration) {
                                        reviewsRequestedInWindowDuration++;
                                    }
                                });
                                if (reviewsRequestedInWindowDuration >= postLimitCount) {
                                    await TransactionSession.abortTransaction(ts);
                                    rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
                                    rejectObject.setMessage(Constants.ASSETMGMT.POST.UPDATE_ONE.ERROR_EXHAUSTED_REVIEWS_FOR_PERIOD);
                                    rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.SYSTEM);
                                    return Promise.reject(rejectObject.jsonObject());
                                } else {
                                    userToUpdate.profileData.membershipProfile.remainingReviews = caller.profileData.membershipProfile.remainingReviews - 1;
                                    userToUpdate.profileData.membershipProfile.reviewRequestedAt = caller.profileData.membershipProfile.reviewRequestedAt;
                                    while (userToUpdate.profileData.membershipProfile.reviewRequestedAt.length >= postLimitCount) {
                                        userToUpdate.profileData.membershipProfile.reviewRequestedAt.shift();
                                    }
                                    userToUpdate.profileData.membershipProfile.reviewRequestedAt.push(Date.now());
                                }
                            } else {
                                rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
                                rejectObject.setMessage(Constants.ASSETMGMT.POST.UPDATE_ONE.ERROR_MEMBERSHIP_NOT_FOUND);
                                rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.SYSTEM);
                                return Promise.reject(rejectObject.jsonObject());
                            }

                            [error1, result1] = await To(UserService.updateOneById(caller._id, userToUpdate, null));
                            if (CommonValidator.isSuccessResponseAndNonEmptyData(result1)) {
                                await TransactionSession.commitTransaction(ts);
                                resolveObject.setMessage(Constants.ASSETMGMT.POST.UPDATE_ONE.SUCCESS_UPDATED_REVIEW_CREDITS);
                                return Promise.resolve(resolveObject.jsonObject());
                            } else {
                                await TransactionSession.abortTransaction(ts);
                                rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
                                rejectObject.setMessage(Constants.ASSETMGMT.POST.UPDATE_ONE.ERROR_UPDATING_REVIEW_CREDITS);
                                rejectObject.appendMessage(error1.message);
                                rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.SYSTEM);
                                rejectObject.setDetails(error1);
                                return Promise.reject(rejectObject.jsonObject());
                            }
                        } else {
                            await TransactionSession.abortTransaction(ts);
                            rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
                            rejectObject.setMessage(Constants.ASSETMGMT.POST.UPDATE_ONE.ERROR_MEMBERSHIP_NO_REVIEW_CREDITS);
                            rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                            return Promise.reject(rejectObject.jsonObject());
                        }
                    } else {
                        await TransactionSession.abortTransaction(ts);
                        rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
                        rejectObject.setMessage(Constants.ASSETMGMT.POST.UPDATE_ONE.ERROR_MEMBERSHIP_NOT_FOUND);
                        rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                        return Promise.reject(rejectObject.jsonObject());
                    }
                } else {
                    await TransactionSession.abortTransaction(ts);
                    rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
                    rejectObject.appendMessage(error.message);
                    rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                    rejectObject.setDetails(error);
                    return Promise.reject(rejectObject.jsonObject());
                }
            } else {
                rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
                rejectObject.appendMessage(Constants.ASSETMGMT.POST.UPDATE_ONE.ERROR_NOT_AUTHORIZED);
                rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                return Promise.reject(rejectObject.jsonObject());
            }
        } else {
            rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
            rejectObject.appendMessage(Constants.ASSETMGMT.POST.GET_ONE_BY_ID.ERROR);
            rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {

        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.POST.UPDATE_ONE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);
        return Promise.reject(rejectObject.jsonObject());
    }
}

/**
* update fav for one post
* @param {*} gamePostId 
* @param {*} reviewIndex 
*/
async function updateFavById(caller, gamePostId, favValue, flags) {
    let error, result;
    var rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
        Constants.ASSETMGMT.POST.UPDATE_ONE.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
        null
    );
    try {
        if (!flags) {
            flags = {};
        }
        let existingPost = {};
        [error, result] = await To(PostService.getOneById(gamePostId, flags));
        if (CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
            existingPost = result.data;
            let post = {};
            if ((caller.role === 'player') && (caller._id.equals(existingPost.poster))) {
                post.updatedBy = caller._id;
                post.fav = favValue;
                error = result = null;
                [error, result] = await To(PostService.updateOneById(existingPost._id, post));
                if (CommonValidator.isSuccessResponse(result)) {
                    let filteredData = {};
                    filteredData._id = result.data._id;
                    filteredData.poster = result.data.poster;
                    filteredData.fav = result.data.fav;
                    filteredData.createdBy = result.data.createdBy;
                    filteredData.updatedBy = result.data.updatedBy;
                    filteredData.updatedAt = result.data.updatedAt;
                    result.data = filteredData;
                    return Promise.resolve(result);
                } else {
                    return Promise.reject(error);
                }
            } else {
                rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
                rejectObject.appendMessage(Constants.ASSETMGMT.POST.UPDATE_ONE.ERROR_NOT_AUTHORIZED);
                rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                return Promise.reject(rejectObject.jsonObject());
            }
        } else {
            rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
            rejectObject.appendMessage(Constants.ASSETMGMT.POST.GET_ONE_BY_ID.ERROR);
            rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {

        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.POST.UPDATE_ONE.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);
        return Promise.reject(rejectObject.jsonObject());
    }
}

/**
* update fav for one post
* @param {*} gamePostId 
* @param {*} reviewIndex 
*/
async function deleteOneById(caller, gamePostId, flags) {
    let error, result;
    var rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
        Constants.ASSETMGMT.POST.DELETE_ONE_BY_ID.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
        null
    );
    try {
        if (!flags) {
            flags = {};
        }
        let existingPost = {};
        [error, result] = await To(PostService.getOneById(gamePostId, flags));
        if (CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
            existingPost = result.data;
            if ((caller.role === 'player') && (caller._id.equals(existingPost.poster))) {

                try {
                    const fileServerUrl = Config.FILE.URL + Config.FILE.STREAM;

                    let response;
                    if (CommonValidator.isNonEmptyArray(existingPost.game)) {
                        for (let i = 0; i < existingPost.game.length; i++) {
                            if (existingPost.game.path) {
                                response = await axios.delete(fileServerUrl + '?' + existingPost.game[i].path);
                            }
                            if (existingPost.game.tnPath) {
                                response = await axios.delete(fileServerUrl + '?' + existingPost.game[i].tnPath);
                            }
                            if (existingPost.review && existingPost.review.path) {
                                response = await axios.delete(fileServerUrl + '?' + existingPost.review.path);
                            }
                        }
                    }

                } catch (err) {
                    error = result = null;
                    [error, result] = await To(PostService.deleteOneById(existingPost._id));
                    return Promise.reject(handleAxiosError(err, Constants.ASSETMGMT.POST.DELETE_ONE_BY_ID.ERROR));
                }

                error = result = null;
                [error, result] = await To(PostService.deleteOneById(existingPost._id));
                if (CommonValidator.isSuccessResponse(result)) {
                    return Promise.resolve(result);
                } else {
                    return Promise.reject(error);
                }
            } else {
                rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
                rejectObject.appendMessage(Constants.ASSETMGMT.POST.DELETE_ONE_BY_ID.ERROR_NOT_AUTHORIZED);
                rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                return Promise.reject(rejectObject.jsonObject());
            }
        } else {
            rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
            rejectObject.appendMessage(Constants.ASSETMGMT.POST.DELETE_ONE_BY_ID.ERROR_ID_NOT_FOUND);
            rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {

        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.POST.DELETE_ONE_BY_ID.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);
        return Promise.reject(rejectObject.jsonObject());
    }
}

/**
* end one post session
* @param {*} _id
* @param {*} flags 
*/
async function endPostSession(caller, gamePostId, flags) {
    let error, result;
    var rejectObject = new RejectData(
        CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
        Constants.ASSETMGMT.POST.END_ONE_POST_SESSION.ERROR,
        CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
        null
    );
    var resolveObject = new ResolveData(
        CommonConstants.COMMON.APP_HTTP.STATUS.OK.CODE,
        Constants.ASSETMGMT.POST.END_ONE_POST_SESSION.SUCCESS,
        null
    );

    try {
        if (!flags) {
            flags = {};
        }
        let existingPost = {};
        [error, result] = await To(PostService.getOneById(gamePostId, flags));
        if (CommonValidator.isSuccessResponseAndNonEmptyData(result)) {
            existingPost = result.data;
            let post = {};
            if ((caller.role === 'player') && (caller._id.equals(existingPost.poster))) {
                if (existingPost.session && CommonValidator.isVaildAndNonEmptyObject(existingPost.session)) {
                    post.session = {};
                } else {
                    rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
                    rejectObject.appendMessage(Constants.ASSETMGMT.POST.END_ONE_POST_SESSION.ERROR_NO_EXISTING_SESSION);
                    rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                    return Promise.reject(rejectObject.jsonObject());
                }
                post.updatedBy = caller._id;
                error = result = null;
                [error, result] = await To(PostService.updateOneById(existingPost._id, post));
                if (CommonValidator.isSuccessResponse(result)) {
                    resolveObject.setData(result.data);
                    return Promise.resolve(resolveObject.jsonObject());
                } else {
                    rejectObject.appendMessage(error.message);
                    rejectObject.setDetails(error);
                    return Promise.reject(error);
                }
            } else {
                rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
                rejectObject.appendMessage(Constants.ASSETMGMT.POST.END_ONE_POST_SESSION.ERROR_NOT_AUTHORIZED);
                rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
                return Promise.reject(rejectObject.jsonObject());
            }
        } else {
            rejectObject.setCode(CommonConstants.COMMON.APP_HTTP.STATUS.BAD_REQUEST.CODE);
            rejectObject.appendMessage(Constants.ASSETMGMT.POST.END_ONE_POST_SESSION.ERROR);
            rejectObject.setType(CommonConstants.COMMON.APP_ERROR.TYPE.DATA);
            return Promise.reject(rejectObject.jsonObject());
        }
    } catch (e) {

        rejectObject = new RejectData(
            CommonConstants.COMMON.APP_HTTP.STATUS.CONFLICT.CODE,
            Constants.ASSETMGMT.POST.END_ONE_POST_SESSION.ERROR,
            CommonConstants.COMMON.APP_ERROR.TYPE.UNKNOWN,
            e);
        rejectObject.appendMessage(e.message);
        return Promise.reject(rejectObject.jsonObject());
    }
}
