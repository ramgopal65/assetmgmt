const Constants = require('../constant/constant');

module.exports = {
    all: [
        {
            name: 'KidsTracker',
            code: 'kidstracker',
            description: 'Kids tracker watch',
            props: [
                {
                    propName: 'hwv',
                    propValueType: 'string',
                    propValue: '1.0',
                    propDescription: 'tracker hw version'
                }
            ],
            features: [
                {
                    name: Constants.ASSETMGMT.APP_FEATURE.LOCATION.NAME,
                    code: Constants.ASSETMGMT.APP_FEATURE.LOCATION.CODE,
                    description: Constants.ASSETMGMT.APP_FEATURE.LOCATION.DESCRIPTION,
                    interactions: [
                        Constants.ASSETMGMT.APP_INTERACTION.LOCATION_PUBLISH
                    ]
                },
                {
                    name: Constants.ASSETMGMT.APP_FEATURE.GEOFENCE.NAME,
                    code: Constants.ASSETMGMT.APP_FEATURE.GEOFENCE.CODE,
                    description: Constants.ASSETMGMT.APP_FEATURE.GEOFENCE.DESCRIPTION,
                    interactions: [
                        Constants.ASSETMGMT.APP_INTERACTION.GEOFENCE_SETTING,
                        Constants.ASSETMGMT.APP_INTERACTION.GEOFENCE_PUBLISH,
                    ]
                },
                {
                    name: Constants.ASSETMGMT.APP_FEATURE.PHONEBOOK.NAME,
                    code: Constants.ASSETMGMT.APP_FEATURE.PHONEBOOK.CODE,
                    description: Constants.ASSETMGMT.APP_FEATURE.PHONEBOOK.DESCRIPTION,
                    interactions: [
                        Constants.ASSETMGMT.APP_INTERACTION.PHONEBOOK_SETTING,
                    ]
                },
                {
                    name: Constants.ASSETMGMT.APP_FEATURE.DETAIL.NAME,
                    code: Constants.ASSETMGMT.APP_FEATURE.DETAIL.CODE,
                    description: Constants.ASSETMGMT.APP_FEATURE.DETAIL.DESCRIPTION,
                    interactions: [
                        Constants.ASSETMGMT.APP_INTERACTION.DETAIL_SETTING,
                        Constants.ASSETMGMT.APP_INTERACTION.DETAIL_PUBLISH
                    ]
                },
                {
                    name: Constants.ASSETMGMT.APP_FEATURE.SOS.NAME,
                    code: Constants.ASSETMGMT.APP_FEATURE.SOS.CODE,
                    description: Constants.ASSETMGMT.APP_FEATURE.SOS.DESCRIPTION,
                    interactions: [
                        Constants.ASSETMGMT.APP_INTERACTION.SOS_PUBLISH
                    ]
                }
            ],
        },
        {
            name: 'BorqsCluster',
            code: 'borqscluster',
            description: 'Borqs cluster for eBike',
            props: [
                {
                    propName: 'hwv',
                    propValueType: 'string',
                    propValue: '1.0',
                    propDescription: 'hw version'
                },
                {
                    propName: 'bCap',
                    propValueType: 'string',
                    propValue: '2250',
                    propDescription: 'battery capacity in mAh'
                }
            ],
            features: [
                {
                    name: Constants.ASSETMGMT.APP_FEATURE.DETAIL.NAME,
                    code: Constants.ASSETMGMT.APP_FEATURE.DETAIL.CODE,
                    description: Constants.ASSETMGMT.APP_FEATURE.DETAIL.DESCRIPTION,
                    interactions: [
                        Constants.ASSETMGMT.APP_INTERACTION.DETAIL_SETTING,
                        Constants.ASSETMGMT.APP_INTERACTION.DETAIL_PUBLISH
                    ]
                },
                {
                    name: Constants.ASSETMGMT.APP_FEATURE.SOS.NAME,
                    code: Constants.ASSETMGMT.APP_FEATURE.SOS.CODE,
                    description: Constants.ASSETMGMT.APP_FEATURE.SOS.DESCRIPTION,
                    interactions: [
                        Constants.ASSETMGMT.APP_INTERACTION.SOS_PUBLISH
                    ]
                }
            ]
        }
    ]
};