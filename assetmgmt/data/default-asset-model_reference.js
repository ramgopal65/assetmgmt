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
                'loc',
                'tel'
            ]
        }
    ]
};