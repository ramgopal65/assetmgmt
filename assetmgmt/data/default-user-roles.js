const CommonConstants = require('../../common/constant/constant');

module.exports = {
    DEFAULT_ADMIN: {
        'email': {
            'email': 'default.admin@borqs.io'
        },
        'password': 'Borqs@1234',
        'profileData': {
            'name': {
                'firstName': 'Default',
                'lastName': 'Admin'
            },
            'dob': '01-01-2000',
            'gender': 'Male',
            'weight': 75,
            'height': 190
        },
        'role': 'admin'
    },
    DEFAULT_ENTERPRISE_ROOT_OWNER: {
        'email': {
            'email': 'default.enterprise.root.owner@borqs.io'
        },
        'password': 'Borqs@1234',
        'profileData': {
            'name': {
                'firstName': 'Default',
                'middleName': 'Enterprise',
                'lastName': 'Root Owner'
            },
            'dob': '01-01-2000',
            'gender': 'Male',
            'weight': 75,
            'height': 190
        },
        'role': 'enterprise_root_owner'
    },
    DEFAULT_ENTERPRISE_OWNER: {
        'email': {
            'email': 'default.enterprise.owner@borqs.io',
        },
        'password': 'Borqs@1234',
        'profileData': {
            'name': {
                'firstName': 'Default',
                'middleName': 'Enterprise',
                'lastName': 'Owner'
            },
            'dob': '01-01-2000',
            'gender': 'Male',
            'weight': 75,
            'height': 190
        },
        'role': 'enterprise_owner'
    },
    DEFAULT_ENTERPRISE_SUB_OWNER: {
        'email': {
            'email': 'default.enterprise.sub.owner@borqs.io',
        },
        'password': 'Borqs@1234',
        'profileData': {
            'name': {
                'firstName': 'Default',
                'middleName': 'Enterprise',
                'lastName': 'Sub Owner'
            },
            'dob': '01-01-2000',
            'gender': 'Male',
            'weight': 75,
            'height': 190
        },
        'role': 'enterprise_owner'
    }

};