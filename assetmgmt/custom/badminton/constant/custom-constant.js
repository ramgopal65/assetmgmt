const CustomExtendableConstants = require('../../../constant/custom-extendable-constant');

const CUSTOM_USER_ROLE_NAMES_BADMINTON = {
    /*
    * Additional USER_ROLE_NAMES supported for badminton
    */
    COACH: 'coach',
    PLAYER: 'player',
    REVIEWER: 'reviewer'
};
//populate CUSTOM_USER_ROLE_NAMES_BADMINTON into Constants.ASSETMGMT.APP_USER_ROLE_NAMES
//console.log(Constants.ASSETMGMT.APP_USER_ROLE_NAMES);
for (var customRoleKey in CUSTOM_USER_ROLE_NAMES_BADMINTON) {
    CustomExtendableConstants.USER_ROLE_NAMES[customRoleKey] = CUSTOM_USER_ROLE_NAMES_BADMINTON[customRoleKey];
}
//console.log(Constants.ASSETMGMT.APP_USER_ROLE_NAMES);

const CUSTOM_USER_BADMINTON = {
    ROLE: [
        {
            CODE: CUSTOM_USER_ROLE_NAMES_BADMINTON.COACH,
            LEVEL: CustomExtendableConstants.CUSTOM_USER_ROLE_START_LEVEL,
            SSO_SUBJECT: 'sso token for ' + CUSTOM_USER_ROLE_NAMES_BADMINTON.COACH,
            CUSTOM_ROLE: true,
            SINGLETON: false,
            SYSTEM_ROLE: false,
            CONTENT_OWNER: false,
            HIERARCHICAL_ROLE: CustomExtendableConstants.USER_HEIRARCHICAL_ROLE_TYPE.NODE,
            ROLE_ASSOCIATION_TYPE: CustomExtendableConstants.USER_ROLE_ASSOCIATION.MANY,
            ASSOCIATE_ROLE_NAME: CUSTOM_USER_ROLE_NAMES_BADMINTON.PLAYER,
            MEMBERSHIP: false

        },
        {
            CODE: CUSTOM_USER_ROLE_NAMES_BADMINTON.PLAYER,
            LEVEL: CustomExtendableConstants.CUSTOM_USER_ROLE_START_LEVEL,
            SSO_SUBJECT: 'sso token for ' + CUSTOM_USER_ROLE_NAMES_BADMINTON.PLAYER,
            CUSTOM_ROLE: true,
            SINGLETON: false,
            SYSTEM_ROLE: false,
            CONTENT_OWNER: true,
            HIERARCHICAL_ROLE: CustomExtendableConstants.USER_HEIRARCHICAL_ROLE_TYPE.NODE,
            ROLE_ASSOCIATION_TYPE: CustomExtendableConstants.USER_ROLE_ASSOCIATION.ONE,
            ASSOCIATE_ROLE_NAME: CUSTOM_USER_ROLE_NAMES_BADMINTON.COACH,
            MEMBERSHIP: true
        },
        {
            CODE: CUSTOM_USER_ROLE_NAMES_BADMINTON.REVIEWER,
            LEVEL: CustomExtendableConstants.CUSTOM_USER_ROLE_START_LEVEL,
            SSO_SUBJECT: 'sso token for ' + CUSTOM_USER_ROLE_NAMES_BADMINTON.REVIEWER,
            CUSTOM_ROLE: true,
            SINGLETON: true,
            SYSTEM_ROLE: true,
            CONTENT_OWNER: false,
            ROLE_ASSOCIATION_TYPE: CustomExtendableConstants.USER_ROLE_ASSOCIATION.NONE,
            HIERARCHICAL_ROLE: CustomExtendableConstants.USER_HEIRARCHICAL_ROLE_TYPE.NONE,
            MEMBERSHIP: false
        }
    ]
};

//populate CUSTOM_USER_BADMINTON into Constants.ASSETMGMT.APP_PLAYER.USER.ROLE
//console.log(Constants.ASSETMGMT.APP_PLAYER.USER.ROLE);
CUSTOM_USER_BADMINTON.ROLE.forEach((customUserRole) => {
    CustomExtendableConstants.USER_ROLES.push(customUserRole);
});
//console.log(Constants.ASSETMGMT.APP_PLAYER.USER.ROLE);

module.exports = {
    CUSTOM_USER_ROLE_NAMES_BADMINTON
};