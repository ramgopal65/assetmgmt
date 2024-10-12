require('dotenv').config();
const Request = require('supertest');

let AssetMgmtServer;
let isAlreadyRunning = true;

const ENV = process.env;

const delay = ms => new Promise(res => setTimeout(res, ms));
const port = ENV.ASSETMGMT_ASSETMGMT_PORT;
const AssetMgmtBaseRoute = 'http://localhost:' + port;
const WhitelistBaseRoute = '/assetmgmt/whitelist';
const HealthBaseRoute = '/assetmgmt/health';

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


describe('POST - login a super admin', () => {
    let superAdminToken;
    let adminToken;
    let enterpriseRootOwnerToken;
    let enterpriseOwnerToken;
    let enterpriseSubOwnerToken;
    let hierarchyCode;

    const credentials = {
        email: "superadmin@borqs.io",
        password: "borqs@1234"
    };

    beforeEach(async () => {
        const response = await Request(AssetMgmtBaseRoute).post('/assetmgmt/user/login').send(credentials);
        expect(response.statusCode).toBe(200);
        superAdminToken = response.body.data.token.token;
    });

    it('should create an admin', async () => {
        const credentials = {
            email: "mithun.admin@borqs.io",
            password: "Borqs@1234",
            profileData: {
                name: {
                    firstName: "Admin",
                    lastName: "User"
                },
                dob: "01-01-2000",
                gender: "Male",
                weight: 75,
                height: 190
            },
            role: "admin"
        };
        const response = await Request(AssetMgmtBaseRoute).put('/assetmgmt/user').set('Authorization', `Bearer ${superAdminToken}`).send(credentials);
        expect(response.statusCode).toBe(200);
    });

    it('should login an admin', async () => {
        const credentials = {
            email: "mithun.admin@borqs.io",
            password: "Borqs@1234"
        };
        const response = await Request(AssetMgmtBaseRoute).post('/assetmgmt/user/login').send(credentials);
        expect(response.statusCode).toBe(200);
        adminToken = response.body.data.token.token;
    });

    it('should create an enterprise root owner', async () => {
        const credentials = {
            email: "mithun.enterprise.root.owner@borqs.io",
            password: "Borqs@1234",
            profileData: {
                name: {
                    firstName: "Default",
                    middleName: "Enterprise",
                    lastName: "Root"
                },
                dob: "01-01-2000",
                gender: "Male",
                weight: 75,
                height: 190
            },
            role: "enterprise_root_owner"
        };
        const response = await Request(AssetMgmtBaseRoute).put('/assetmgmt/user').set('Authorization', `Bearer ${adminToken}`).send(credentials);
        expect(response.statusCode).toBe(200);
    });

    it('should login an enterprise root owner', async () => {
        const credentials = {
            email: "mithun.enterprise.root.owner@borqs.io",
            password: "Borqs@1234"
        };
        const response = await Request(AssetMgmtBaseRoute).post('/assetmgmt/user/login').send(credentials);
        expect(response.statusCode).toBe(200);
        enterpriseRootOwnerToken = response.body.data.token.token;
    });

    it('should create an enterprise owner', async () => {
        const credentials = {
            email: "mithun.enterprise.owner@borqs.io",
            password: "Borqs@1234",
            profileData: {
                name: {
                    firstName: "Default",
                    middleName: "Enterprise",
                    lastName: "Owner"
                },
                dob: "01-01-2000",
                gender: "Male",
                weight: 75,
                height: 190
            },
            role: "enterprise_owner"
        };
        const response = await Request(AssetMgmtBaseRoute).put('/assetmgmt/user').set('Authorization', `Bearer ${enterpriseRootOwnerToken}`).send(credentials);
        expect(response.statusCode).toBe(200);
    });

    it('should login an enterprise owner', async () => {
        const credentials = {
            email: "mithun.enterprise.owner@borqs.io",
            password: "Borqs@1234"
        };
        const response = await Request(AssetMgmtBaseRoute).post('/assetmgmt/user/login').send(credentials);
        expect(response.statusCode).toBe(200);
        enterpriseOwnerToken = response.body.data.token.token;
    });

    it('should create an enterprise sub owner', async () => {
        const credentials = {
            email: "mithun.enterprise.sub.owner@borqs.io",
            password: "Borqs@1234",
            profileData: {
                name: {
                    firstName: "Enterprise",
                    middleName: "Sub",
                    lastName: "Owner"
                },
                dob: "01-01-2000",
                gender: "Male",
                weight: 75,
                height: 190
            },
            role: "enterprise_owner"
        };
        const response = await Request(AssetMgmtBaseRoute).put('/assetmgmt/user').set('Authorization', `Bearer ${enterpriseOwnerToken}`).send(credentials);
        expect(response.statusCode).toBe(200);
    });

    it('should login an enterprise sub owner', async () => {
        const credentials = {
            email: "mithun.enterprise.sub.owner@borqs.io",
            password: "Borqs@1234"
        };
        const response = await Request(AssetMgmtBaseRoute).post('/assetmgmt/user/login').send(credentials);
        expect(response.statusCode).toBe(200);
        enterpriseSubOwnerToken = response.body.data.token.token;
        hierarchyCode = response.body.data.hierarchyCode;
    });

    describe('PUT - create a whitelist entry', () => {
        it('should create a whitelist entry successfully', async () => {
            const testObject = {
                player: {
                    phone: {
                        cc: "+91",
                        number: "1234567777"
                    }
                },
                coach: {
                    phone: {
                        cc: "+91",
                        number: "9876543210"
                    }
                },
                hierarchyCode: hierarchyCode
            };
            const response = await Request(AssetMgmtBaseRoute)
                .put(WhitelistBaseRoute).set('Authorization', `Bearer ${enterpriseSubOwnerToken}`)
                .send(testObject);
            expect(response.status).toBe(200);
            expect(response.body.code).toEqual(200);
        });

        it('should create a whitelist entry successfully', async () => {
            const testObject = {
                player: {
                    email: "player11@email.com"
                },
                coach: {
                    phone: {
                        cc: "+91",
                        number: "9876543213"
                    }
                },
                hierarchyCode: hierarchyCode
            };
            const response = await Request(AssetMgmtBaseRoute)
                .put(WhitelistBaseRoute).set('Authorization', `Bearer ${enterpriseSubOwnerToken}`)
                .send(testObject);
            expect(response.status).toBe(200);
            expect(response.body.code).toEqual(200);
        });
        it('should create a whitelist entry successfully', async () => {
            const testObject = {
                player: {
                    phone: {
                        cc: "+91",
                        number: "1234567899"
                    }
                },
                coach: {
                    phone: {
                        cc: "+91",
                        number: "9876543212"
                    }
                },
                hierarchyCode: hierarchyCode
            }
            const response = await Request(AssetMgmtBaseRoute)
                .put(WhitelistBaseRoute).set('Authorization', `Bearer ${enterpriseSubOwnerToken}`)
                .send(testObject);
            expect(response.status).toBe(200);
            expect(response.body.code).toEqual(200);
        });
        it('should create a whitelist entry successfully with player1 phone and coach email', async () => {
            const testObject = {
                player: {
                    phone: {
                        cc: "+91",
                        number: "1234567778"
                    }
                },
                coach: {
                    email: "coach1@email.com"
                },
                hierarchyCode: hierarchyCode
            }
            const response = await Request(AssetMgmtBaseRoute)
                .put(WhitelistBaseRoute).set('Authorization', `Bearer ${enterpriseSubOwnerToken}`)
                .send(testObject);
            expect(response.status).toBe(200);
            expect(response.body.code).toEqual(200);
        });
        it('should create a whitelist entry successfully with player2 phone and coach email', async () => {
            const testObject = {
                player: {
                    phone: {
                        cc: "+91",
                        number: "1234567779"
                    }
                },
                coach: {
                    email: "coach1@email.com"
                },
                hierarchyCode: hierarchyCode
            }
            const response = await Request(AssetMgmtBaseRoute)
                .put(WhitelistBaseRoute).set('Authorization', `Bearer ${enterpriseSubOwnerToken}`)
                .send(testObject);
            expect(response.status).toBe(200);
            expect(response.body.code).toEqual(200);
        });
        it('should create a whitelist entry successfully with player1 email and coach2 phone', async () => {
            const testObject = {
                player: {
                    email: "player1@email.com"
                },
                coach: {
                    phone: {
                        cc: "+91",
                        number: "9876543222"
                    }
                },
                hierarchyCode: hierarchyCode
            }
            const response = await Request(AssetMgmtBaseRoute)
                .put(WhitelistBaseRoute).set('Authorization', `Bearer ${enterpriseSubOwnerToken}`)
                .send(testObject);
            expect(response.status).toBe(200);
            expect(response.body.code).toEqual(200);
        });
        it('should create a whitelist entry successfully with player2 email and coach2 email', async () => {
            const testObject = {
                player: {
                    email: "player4@email.com"
                },
                coach: {
                    email: "coach2@email.com"
                },
                hierarchyCode: hierarchyCode
            }
            const response = await Request(AssetMgmtBaseRoute)
                .put(WhitelistBaseRoute).set('Authorization', `Bearer ${enterpriseSubOwnerToken}`)
                .send(testObject);
            expect(response.status).toBe(200);
            expect(response.body.code).toEqual(200);
        });
        it('should create a whitelist entry successfully with player3 email and coach email', async () => {
            const testObject = {
                player: {
                    email: "player3@email.com"
                },
                coach: {
                    email: "coach2@email.com"
                },
                hierarchyCode: hierarchyCode
            }
            const response = await Request(AssetMgmtBaseRoute)
                .put(WhitelistBaseRoute).set('Authorization', `Bearer ${enterpriseSubOwnerToken}`)
                .send(testObject);
            expect(response.status).toBe(200);
            expect(response.body.code).toEqual(200);
        });
    });

    describe('POST - get a whitelist entry', () => {
        it('should get a whitelist entry successfully with player phone', async () => {
            const testObject = {
                phone: {
                    cc: "+91",
                    number: "1234567777"
                },
                role: "player"
            }
            const response = await Request(AssetMgmtBaseRoute)
                .post(WhitelistBaseRoute)
                .send(testObject);
            expect(response.status).toBe(200);
            expect(response.body.message).toEqual("entered data is in our whitelist");
        });
        it('should get a whitelist entry successfully with player email', async () => {
            const testObject = {
                email: {
                    email: "player1@email.com"
                },
                role: "player"
            }
            const response = await Request(AssetMgmtBaseRoute)
                .post(WhitelistBaseRoute)
                .send(testObject);
            expect(response.status).toBe(200);
            expect(response.body.message).toEqual("entered data is in our whitelist");
        });
        it('should get a whitelist entry successfully with coach phone', async () => {
            const testObject = {
                phone: {
                    cc: "+91",
                    number: "9876543213"
                },
                role: "coach"
            }
            const response = await Request(AssetMgmtBaseRoute)
                .post(WhitelistBaseRoute)
                .send(testObject);
            expect(response.status).toBe(200);
            expect(response.body.message).toEqual("entered data is in our whitelist");
        });
        it('should get a whitelist entry successfully with coach email', async () => {
            const testObject = {
                email: {
                    email: "coach1@email.com"
                },
                role: "coach"
            }
            const response = await Request(AssetMgmtBaseRoute)
                .post(WhitelistBaseRoute)
                .send(testObject);
            expect(response.status).toBe(200);
            expect(response.body.message).toEqual("entered data is in our whitelist");
        });
        it('should return an error while getting a whitelist entry when the player number is not in our database', async () => {
            const testObject = {
                phone: {
                    cc: "+91",
                    number: "1234566666"
                },
                role: "player"
            }
            const response = await Request(AssetMgmtBaseRoute)
                .post(WhitelistBaseRoute)
                .send(testObject);
            expect(response.status).toBe(400);
            expect(response.body.message).toEqual("not in whitelist, contact admin for support");
        });
        it('should return an error while getting a whitelist entry when the coach number is not in our database', async () => {
            const testObject = {
                phone: {
                    cc: "+91",
                    number: "9876549999"
                },
                role: "coach"
            }
            const response = await Request(AssetMgmtBaseRoute)
                .post(WhitelistBaseRoute)
                .send(testObject);
            expect(response.status).toBe(400);
            expect(response.body.message).toEqual("not in whitelist, contact admin for support");
        });
        it('should return an error while getting a whitelist entry when the player email is not in our database', async () => {
            const testObject = {
                email: "player99@email.com",
                role: "player"
            }
            const response = await Request(AssetMgmtBaseRoute)
                .post(WhitelistBaseRoute)
                .send(testObject);
            expect(response.status).toBe(400);
            expect(response.body.message).toEqual("not in whitelist, contact admin for support");
        });
        it('should return an error while getting a whitelist entry when the coach email is not in our database', async () => {
            const testObject = {
                email: "coach99@email.com",
                role: "coach"
            }
            const response = await Request(AssetMgmtBaseRoute)
                .post(WhitelistBaseRoute)
                .send(testObject);
            expect(response.status).toBe(400);
            expect(response.body.message).toEqual("not in whitelist, contact admin for support");
        });
    });

    describe('UPDATE - update coach in all entries', () => {
        it('should return success once all the relevant phone entries are updated from the database', async () => {
            const testObject = {
                coach: {
                    phone: {
                        cc: "+91",
                        number: "9876543210"
                    }
                },
                newCoach: {
                    phone: {
                        cc: "+91",
                        number: "8619032211"
                    }
                }
            }
            const response = await Request(AssetMgmtBaseRoute)
                .patch(WhitelistBaseRoute + '/update-coach').set('Authorization', `Bearer ${enterpriseSubOwnerToken}`)
                .send(testObject);
            expect(response.status).toBe(200);
            expect(response.body.message).toEqual("whitelisted data updated successfully");
        });
        it('should return failure if the coach phone is not updated in the database', async () => {
            const testObject = {
                coach: {
                    phone: {
                        cc: "+91",
                        number: "9876543210"
                    }
                },
                newCoach: {
                    phone: {
                        cc: "+91",
                        number: "8619032211"
                    }
                }
            }
            const response = await Request(AssetMgmtBaseRoute)
                .patch(WhitelistBaseRoute + '/update-coach').set('Authorization', `Bearer ${enterpriseSubOwnerToken}`)
                .send(testObject);
            expect(response.status).toBe(400);
            expect(response.body.message).toEqual("error while updating one entry");
        });
        it('should return success once all the relevant email entries are updated from the database', async () => {
            const testObject = {
                coach: {
                    email: "coach1@email.com"
                },
                newCoach: {
                    email: "coach99@email.com"
                }
            }
            const response = await Request(AssetMgmtBaseRoute)
                .patch(WhitelistBaseRoute + '/update-coach').set('Authorization', `Bearer ${enterpriseSubOwnerToken}`)
                .send(testObject);
            expect(response.status).toBe(200);
            expect(response.body.message).toEqual("whitelisted data updated successfully");
        });
        it('should return failure if the coach email is not updated in the database', async () => {
            const testObject = {
                coach: {
                    email: "coach1@email.com"
                },
                newCoach: {
                    email: "coach99@email.com"
                }
            }
            const response = await Request(AssetMgmtBaseRoute)
                .patch(WhitelistBaseRoute + '/update-coach').set('Authorization', `Bearer ${enterpriseSubOwnerToken}`)
                .send(testObject);
            expect(response.status).toBe(400);
            expect(response.body.message).toEqual("error while updating one entry");
        });
    });
    
    describe('DELETE - delete one entry from the whitelist', () => {
        it('should return success once the entry is deleted from the database', async () => {
            const testObject = {
                phone: {
                    cc: "+91",
                    number: "1234567899"
                },
                role: 'player'
            }
            const response = await Request(AssetMgmtBaseRoute)
                .delete(WhitelistBaseRoute).set('Authorization', `Bearer ${enterpriseSubOwnerToken}`)
                .send(testObject);
            expect(response.status).toBe(200);
            expect(response.body.message).toEqual("whitelisted data deleted successfully");
        });
        it('should return failure if the number is not in our database to be deleted', async () => {
            const testObject = {
                phone: {
                    cc: "+91",
                    number: "1234567899"
                },
                role: "player"
            }
            const response = await Request(AssetMgmtBaseRoute)
                .delete(WhitelistBaseRoute).set('Authorization', `Bearer ${enterpriseSubOwnerToken}`)
                .send(testObject);
            expect(response.status).toBe(400);
            expect(response.body.message).toEqual("error while deleting one entry");
        });
        it('should return success once the email entry is deleted from the database', async () => {
            const testObject = {
                email: "player1@email.com",
                role: "player"
            }
            const response = await Request(AssetMgmtBaseRoute)
                .delete(WhitelistBaseRoute).set('Authorization', `Bearer ${enterpriseSubOwnerToken}`)
                .send(testObject);
            expect(response.status).toBe(200);
            expect(response.body.message).toEqual("whitelisted data deleted successfully");
        });
        it('should return failure if the email is not in our database to be deleted', async () => {
            const testObject = {
                email: "player1@email.com",
                role: "player"
            }
            const response = await Request(AssetMgmtBaseRoute)
                .delete(WhitelistBaseRoute).set('Authorization', `Bearer ${enterpriseSubOwnerToken}`)
                .send(testObject);
            expect(response.status).toBe(400);
            expect(response.body.message).toEqual("error while deleting one entry");
        });
    });

    describe('DELETE - delete multiple entries from the whitelist', () => {
        it('should return success once all the relevant phone entries are deleted from the database', async () => {
            const testArray = [
                {
                    phone: {
                        cc: "+91",
                        number: "1234567779"
                    }
                },
                {
                    phone: {
                        cc: "+91",
                        number: "1234567777"
                    }
                },
                {
                    phone: {
                        cc: "+91",
                        number: "1234567778"
                    }
                }
            ]
            const response = await Request(AssetMgmtBaseRoute)
                .delete(WhitelistBaseRoute + '/multiple').set('Authorization', `Bearer ${enterpriseSubOwnerToken}`)
                .send(testArray);
            expect(response.status).toBe(200);
            expect(response.body.message).toEqual("multiple whitelisted data deleted successfully");
        });
        it('should return success once all the relevant email entries are deleted from the database', async () => {
            const testArray = [
                {
                    email: "player4@email.com"
                },
                {
                    email: "player3@email.com"
                }
            ]
            const response = await Request(AssetMgmtBaseRoute)
                .delete(WhitelistBaseRoute + '/multiple').set('Authorization', `Bearer ${enterpriseSubOwnerToken}`)
                .send(testArray);
            expect(response.status).toBe(200);
            expect(response.body.message).toEqual("multiple whitelisted data deleted successfully");
        });
        it('should return success once all the relevant email and phone entries are deleted from the database', async () => {
            const testArray = [
                {
                    email: "player11@email.com"
                },
                {
                    phone: {
                        cc: "+91",
                        number: "1234567899"
                    }
                }
            ]
            const response = await Request(AssetMgmtBaseRoute)
                .delete(WhitelistBaseRoute + '/multiple').set('Authorization', `Bearer ${enterpriseSubOwnerToken}`)
                .send(testArray);
            expect(response.status).toBe(200);
            expect(response.body.message).toEqual("multiple whitelisted data deleted successfully");
        });
        it('should return failure if any one phone entry in the array is not in our database to be deleted', async () => {
            const testArray = [
                {
                    phone: {
                        cc: "+91",
                        number: "1234567891"
                    }
                },
                {
                    phone: {
                        cc: "+91",
                        number: "1234567892"
                    }
                }
            ]
            const response = await Request(AssetMgmtBaseRoute)
                .delete(WhitelistBaseRoute + '/multiple').set('Authorization', `Bearer ${enterpriseSubOwnerToken}`)
                .send(testArray);
            expect(response.status).toBe(400);
            expect(response.body.message).toEqual("error while deleting multiple entries");
        });
        it('should return failure if any one email entry in the array is not in our database to be deleted', async () => {
            const testArray = [
                {
                    email: "player1@temail.com"
                },
                {
                    email: "player2@email.com"
                }
            ]
            const response = await Request(AssetMgmtBaseRoute)
                .delete(WhitelistBaseRoute + '/multiple').set('Authorization', `Bearer ${enterpriseSubOwnerToken}`)
                .send(testArray);
            expect(response.status).toBe(400);
            expect(response.body.message).toEqual("error while deleting multiple entries");
        });
    });
});
