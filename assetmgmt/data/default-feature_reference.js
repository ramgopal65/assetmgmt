const Constants = require('../constant/constant');

module.exports = {
    all: [
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
        {
            name: Constants.ASSETMGMT.APP_FEATURE.SCHEDULED_LOCATION.NAME,
            code: Constants.ASSETMGMT.APP_FEATURE.SCHEDULED_LOCATION.CODE,
            description: Constants.ASSETMGMT.APP_FEATURE.SCHEDULED_LOCATION.DESCRIPTION,
            interactions: [
                Constants.ASSETMGMT.APP_INTERACTION.LOCATION_SETTING,
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
            name: Constants.ASSETMGMT.APP_FEATURE.SPEED.NAME,
            code: Constants.ASSETMGMT.APP_FEATURE.SPEED.CODE,
            description: Constants.ASSETMGMT.APP_FEATURE.SPEED.DESCRIPTION,
            interactions: [
                Constants.ASSETMGMT.APP_INTERACTION.SPEED_SETTING,
                Constants.ASSETMGMT.APP_INTERACTION.SPEED_PUBLISH
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
        },
        {
            name: Constants.ASSETMGMT.APP_FEATURE.TASK.NAME,
            code: Constants.ASSETMGMT.APP_FEATURE.TASK.CODE,
            description: Constants.ASSETMGMT.APP_FEATURE.TASK.DESCRIPTION,
            interactions: [
                Constants.ASSETMGMT.APP_INTERACTION.TASK_PUBLISH
            ]
        },
        {
            name: Constants.ASSETMGMT.APP_FEATURE.INCIDENT.NAME,
            code: Constants.ASSETMGMT.APP_FEATURE.INCIDENT.CODE,
            description: Constants.ASSETMGMT.APP_FEATURE.INCIDENT.DESCRIPTION,
            interactions: [
                Constants.ASSETMGMT.APP_INTERACTION.INCIDENT_PUBLISH
            ]
        },
        {
            name: Constants.ASSETMGMT.APP_FEATURE.ATTENDANCE.NAME,
            code: Constants.ASSETMGMT.APP_FEATURE.ATTENDANCE.CODE,
            propDescription: Constants.ASSETMGMT.APP_FEATURE.ATTENDANCE.DESCRIPTION,
            interactions: [
                Constants.ASSETMGMT.APP_INTERACTION.ATTENDANCE_PUBLISH
            ]
        }
    ]
};