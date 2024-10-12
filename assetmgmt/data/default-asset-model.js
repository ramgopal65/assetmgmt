const Constants = require('../constant/constant');

module.exports = {
    all: [
        {
            name: 'eBike',
            code: 'ebike',
            description: 'the e bike',
            props: [
                {
                    propName: 'fTy',
                    propValueType: 'string',
                    propValue: 'batt',
                    propDescription: 'fuel type'
                },
                {
                    propName: 'bCap',
                    propValueType: 'int',
                    propValue: '45000',
                    propDescription: 'ebike battery capacity in mAh'
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
                    name: Constants.ASSETMGMT.APP_FEATURE.TELEMETRY.NAME,
                    code: Constants.ASSETMGMT.APP_FEATURE.TELEMETRY.CODE,
                    description: Constants.ASSETMGMT.APP_FEATURE.TELEMETRY.DESCRIPTION,
                    interactions: [
                        Constants.ASSETMGMT.APP_INTERACTION.TELEMERTY_PUBLISH
                    ]
                },
            ]
        }
    ]
};