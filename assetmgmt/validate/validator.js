module.exports = {
    isValidAssetTypeCode: isValidAssetTypeCode,
    isValidGender: isValidGender,
    isValidHeight: isValidHeight,
    isValidWeight: isValidWeight,
    isValidAssociationFieldName: isValidAssociationFieldName, 

};

const Constants = require('../constant/constant');
const CommonValidator = require('../../common/validate/validator');


/**
 * Validate asset type code
 * @param {*} assetType 
 */
function isValidAssetTypeCode(assetType) {
    return (
        assetType == Constants.ASSETMGMT.APP_PLAYER.ASSET.TYPE.PERSON
        || assetType == Constants.ASSETMGMT.APP_PLAYER.ASSET.TYPE.VEHICLE
        || assetType == Constants.ASSETMGMT.APP_PLAYER.ASSET.TYPE.WORKER
    ) ? true : false;
}

/**
 * Check if valid gender
 * @param {*} gender 
 */
function isValidGender(gender) {
    if (CommonValidator.isNonEmptyString(gender)) {
        return (gender.toLowerCase() == Constants.ASSETMGMT.APP_PERSON.GENDER.MALE
            || gender.toLowerCase() == Constants.ASSETMGMT.APP_PERSON.GENDER.FEMALE
            || gender.toLowerCase() == Constants.ASSETMGMT.APP_PERSON.GENDER.OTHER) ? true : false;
    } else {
        return false;
    }
}

/**
 * Check if valid weight
 * @param {*} gender 
 */
function isValidWeight(wt) {
    if ((Constants.ASSETMGMT.APP_PERSON.WEIGHT.MIN <= wt) &&
        (wt <= Constants.ASSETMGMT.APP_PERSON.WEIGHT.MAX)) {
        return true;
    } else {
        return false;
    }
}

/**
 * Check if valid height
 * @param {*} gender 
 */
function isValidHeight(ht) {
    if ((Constants.ASSETMGMT.APP_PERSON.HEIGHT.MIN <= ht) &&
        (ht <= Constants.ASSETMGMT.APP_PERSON.HEIGHT.MAX)) {
        return true;
    } else {
        return false;
    }
}


/**
* Check if valid association field name
* @param {*} fieldName 
*/
function isValidAssociationFieldName(fieldName) {
    let associationRole = Constants.ASSETMGMT.APP_PLAYER.USER.ROLE.filter(function (el) {
        return el.CODE === fieldName;
    });
    if ((associationRole.length === 1) &&
        associationRole[0].ASSOCIATION === Constants.ASSETMGMT.APP_USER_ROLE_ASSOCIATION.MANY) {
        return true;
    }  else {
        return false;
    }
}
