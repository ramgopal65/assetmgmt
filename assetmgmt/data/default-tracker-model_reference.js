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
                'loc',
                'geo',
                'pbk',
                'det',
                'sos'
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
                'det',
                'sos'
            ]
        }
    ]
};