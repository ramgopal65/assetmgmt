require('dotenv').config();
const Request = require('supertest');

let AssetMgmtServer;
let isAlreadyRunning = true;

const ENV = process.env;

const delay = ms => new Promise(res => setTimeout(res, ms));
const port = ENV.ASSETMGMT_ASSETMGMT_PORT;
const AssetMgmtBaseRoute = 'http://localhost:' + port;
const HealthBaseRoute = '/assetmgmt/health';
const AcademyBaseRoute = '/assetmgmt/court';


beforeAll(async () => {
    try {
        let response = await Request(AssetMgmtBaseRoute).get(HealthBaseRoute);
        if (response.body.code == 200 && (response.body.message = 'healthy')) {
            isAlreadyRunning = true;
            console.log('server already running');
            AssetMgmtServer = null;
        } else {
            isAlreadyRunning = false;
            console.log('starting server now');
            AssetMgmtServer = await require('../bin/assetmgmt');
            await delay(15000);
        }
    } catch (e) {
        console.log(e);
        isAlreadyRunning = false;
        console.log(e + ' - starting server now');
        AssetMgmtServer = await require('../bin/assetmgmt');
        await delay(15000);
    }
}, 30000);

afterAll(async () => {
    if (!isAlreadyRunning) {
        AssetMgmtServer.close();
    }
});

describe('POST - login an enterprise owner', () => {
    let enterpriseOwnerToken;
    let userToken;
    let userOtpToken;
    let academyId;

    const credentials = {
        email: 'default.enterprise.owner@borqs.io',
        password: 'Borqs@1234'
    };
    const phoneNumber = {
        type: 'login',
        phone: {
            cc: '+91',
            number: '1234567897'
        }
    };

    beforeEach(async () => {
        const response = await Request(AssetMgmtBaseRoute).post('/assetmgmt/user/login').send(credentials);
        expect(response.statusCode).toBe(200);
        enterpriseOwnerToken = response.body.data.token.token;
        const responseUserOtp = await Request(AssetMgmtBaseRoute).post('/assetmgmt/user/otp').send(phoneNumber);
        expect(responseUserOtp.statusCode).toBe(200);
        userOtpToken = responseUserOtp.body.data.otpToken.otp;

        let userCredentials = {
            phone: {
                cc: '+91',
                number: '1234567897'
            },
            otp: userOtpToken
        }

        const responseUser = await Request(AssetMgmtBaseRoute).post('/assetmgmt/user/login').send(userCredentials);
        expect(responseUser.statusCode).toBe(200);
        userToken = responseUser.body.data.token.token; 
    });

    describe('PUT - create an academy', () => {
        it('should create an academy successfully', async () => {
            const testObject =
            {
                name: 'Cubbon Park',
                courts: [
                    {
                        name: 'Court1',
                        cameras: [
                            {
                                name: 'Cam1',
                                id: '0123456789AABBCC'
                            },
                            {
                                name: 'Cam2',
                                id: '0123456789AABBDD'
                            }
                        ]
                    },
                    {
                        name: 'Court2',
                        cameras: [
                            {
                                name: 'Cam1',
                                id: '0123456789AABBEE'
                            },
                            {
                                name: 'Cam2',
                                id: '0123456789AABBFF'
                            }
                        ]
                    }
                ]
            };
            const response = await Request(AssetMgmtBaseRoute)
                .put(AcademyBaseRoute).set('Authorization', `Bearer ${enterpriseOwnerToken}`)
                .send(testObject);
            expect(response.status).toBe(200);
            expect(response.body.message).toEqual('one academy created successfully');
            academyId = response.body.data._id;
        });

        it('should not create an academy if academy name is already in our database', async () => {
            const testObject = {
                name: 'Cubbon Park',
                courts: [
                    {
                        name: 'Court1',
                        cameras: [
                            {
                                name: 'Cam1',
                                id: '0123456789AABBCC'
                            },
                            {
                                name: 'Cam2',
                                id: '0123456789AABBDD'
                            }
                        ]
                    },
                    {
                        name: 'Court2',
                        cameras: [
                            {
                                name: 'Cam1',
                                id: '0123456789AABBEE'
                            },
                            {
                                name: 'Cam2',
                                id: '0123456789AABBFF'
                            }
                        ]
                    }
                ]
            };
            const response = await Request(AssetMgmtBaseRoute)
                .put(AcademyBaseRoute).set('Authorization', `Bearer ${enterpriseOwnerToken}`)
                .send(testObject);
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('error while creating one academy');
        });

        it('should not create an academy if request body is empty or missing', async () => {
            const testObject = {};
            const response = await Request(AssetMgmtBaseRoute)
                .put(AcademyBaseRoute).set('Authorization', `Bearer ${enterpriseOwnerToken}`)
                .send(testObject);
            expect(response.status).toBe(400);
        });

        it('should not create an academy if user is unauthorized', async () => {
            const testObject = {};
            const response = await Request(AssetMgmtBaseRoute)
                .put(AcademyBaseRoute).set('Authorization', `Bearer ${userToken}`)
                .send(testObject);
            expect(response.status).toBe(401);
            expect(response.body.message).toEqual('unauthorized! insufficient privilege');
        });
    });

    describe('POST - get an academy', () => {
        let testObject = {
            name: 'Cubbon Park',
            court: 'Court1'
        }
        it('should get an academy details successfully', async () => {
            const response = await Request(AssetMgmtBaseRoute)
                .post(AcademyBaseRoute).set('Authorization', `Bearer ${userToken}`).send(testObject)
            expect(response.status).toBe(200);
            expect(response.body.message).toEqual('Success');
        });

        it('should not get an academy if user is unauthorized', async () => {
            const response = await Request(AssetMgmtBaseRoute)
                .post(AcademyBaseRoute).set('Authorization', `Bearer ${enterpriseOwnerToken}`)
                .send(testObject);
            expect(response.status).toBe(400);
            expect(response.body.message).toEqual('unauthorized! invalid token');
        });

        it('should return an error while getting an academy not in our database', async () => {
            testObject = {
                name: 'Marathahlli',
                court: 'Court1'
            }
            const response = await Request(AssetMgmtBaseRoute)
                .post(AcademyBaseRoute).set('Authorization', `Bearer ${userToken}`).send(testObject)
            expect(response.status).toBe(400);
        });

        it('should return an error while getting an academy when the request body is empty or missing', async () => {
            testObject = {};
            const response = await Request(AssetMgmtBaseRoute)
                .post(AcademyBaseRoute).set('Authorization', `Bearer ${userToken}`).send(testObject)
            expect(response.status).toBe(400);
        });
    });

    describe('PATCH - update one academy details', ()=>{
        it('should update one academy successfully', async () => {
            const testObject = {
                name: 'Cubbon Park1',
                courts: [
                    {
                        name: 'Court1',
                        cameras: [
                            {
                                name: 'Cam1',
                                id: '0123456789AABBCC'
                            },
                            {
                                name: 'Cam2',
                                id: '0123456789AABBDD'
                            }
                        ]
                    },
                    {
                        name: 'Court2',
                        cameras: [
                            {
                                name: 'Cam1',
                                id: '0123456789AABBEE'
                            },
                            {
                                name: 'Cam2',
                                id: '0123456789AABBFF'
                            }
                        ]
                    }
                ]
            };
            const response = await Request(AssetMgmtBaseRoute)
                .patch(AcademyBaseRoute + `/${academyId}`).set('Authorization', `Bearer ${enterpriseOwnerToken}`).send(testObject)
            expect(response.status).toBe(200);
            expect(response.body.message).toEqual('one academy details updated successfully');
        });

        it('should not update one academy details if the academy id is not passed/undefined as params', async () => {
            const testObject = {
                name: 'Cubbon Park2',
                courts: [
                    {
                        name: 'Court1',
                        cameras: [
                            {
                                name: 'Cam1',
                                id: '0123456789AABBCC'
                            },
                            {
                                name: 'Cam2',
                                id: '0123456789AABBDD'
                            }
                        ]
                    },
                    {
                        name: 'Court2',
                        cameras: [
                            {
                                name: 'Cam1',
                                id: '0123456789AABBEE'
                            },
                            {
                                name: 'Cam2',
                                id: '0123456789AABBFF'
                            }
                        ]
                    }
                ]
            };
            const id = '';
            const response = await Request(AssetMgmtBaseRoute)
                .patch(AcademyBaseRoute + `/update-academy/${id}`).set('Authorization', `Bearer ${enterpriseOwnerToken}`).send(testObject)
            expect(response.status).toBe(404);
        });

        it('should not update one academy details if the academy id is wrong', async () => {
            const testObject = {
                name: 'Cubbon Park2',
                courts: [
                    {
                        name: 'Court1',
                        cameras: [
                            {
                                name: 'Cam1',
                                id: '0123456789AABBCC'
                            },
                            {
                                name: 'Cam2',
                                id: '0123456789AABBDD'
                            }
                        ]
                    },
                    {
                        name: 'Court2',
                        cameras: [
                            {
                                name: 'Cam1',
                                id: '0123456789AABBEE'
                            },
                            {
                                name: 'Cam2',
                                id: '0123456789AABBFF'
                            }
                        ]
                    }
                ]
            };
            const id = '66f122319061dec6c49246e6';
            const response = await Request(AssetMgmtBaseRoute)
                .patch(AcademyBaseRoute + `/update-academy/${id}`).set('Authorization', `Bearer ${enterpriseOwnerToken}`).send(testObject)
            expect(response.status).toBe(400);
            expect(response.body.message).toEqual('error while updating one entry');
        });

        it('should not update one academy details if the user is unauthorized', async () => {
            const testObject = {
                name: 'Cubbon Park2',
                courts: [
                    {
                        name: 'Court1',
                        cameras: [
                            {
                                name: 'Cam1',
                                id: '0123456789AABBCC'
                            },
                            {
                                name: 'Cam2',
                                id: '0123456789AABBDD'
                            }
                        ]
                    },
                    {
                        name: 'Court2',
                        cameras: [
                            {
                                name: 'Cam1',
                                id: '0123456789AABBEE'
                            },
                            {
                                name: 'Cam2',
                                id: '0123456789AABBFF'
                            }
                        ]
                    }
                ]
            };
            const response = await Request(AssetMgmtBaseRoute)
                .patch(AcademyBaseRoute + `/update-academy/${academyId}`).set('Authorization', `Bearer ${userToken}`).send(testObject)
            expect(response.status).toBe(401);
            expect(response.body.message).toEqual('unauthorized! insufficient privilege');
        });
    });

    describe('DELETE - delete one academy', () => {
        it('should delete one academy successfully', async () => {
            const response = await Request(AssetMgmtBaseRoute)
                .delete(AcademyBaseRoute + `/${academyId}`).set('Authorization', `Bearer ${enterpriseOwnerToken}`)
            expect(response.status).toBe(200);
            expect(response.body.message).toEqual('academy is deleted successfully');
        });

        it('should not delete one academy if user is unauthorized', async () => {
            const response = await Request(AssetMgmtBaseRoute)
                .delete(AcademyBaseRoute + `/${academyId}`).set('Authorization', `Bearer ${userToken}`)
            expect(response.status).toBe(401);
            expect(response.body.message).toEqual('unauthorized! insufficient privilege');
        });

        it('should not delete one academy if id is wrong', async () => {
            academyId = '66f122319061dec6c49246e6';
            const response = await Request(AssetMgmtBaseRoute)
                .delete(AcademyBaseRoute + `/${academyId}`).set('Authorization', `Bearer ${enterpriseOwnerToken}`)
            expect(response.status).toBe(400);
            expect(response.body.message).toEqual('error while deleting one entry');
        });

        it('should not delete one academy if id is not passed in the params', async () => {
            let id = '';
            const response = await Request(AssetMgmtBaseRoute)
                .delete(AcademyBaseRoute + `/${id}`).set('Authorization', `Bearer ${enterpriseOwnerToken}`)
            expect(response.status).toBe(404);
        });
    });
});