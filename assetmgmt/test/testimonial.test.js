require('dotenv').config();
const Request = require('supertest');

let AssetMgmtServer;
let isAlreadyRunning = true;

const ENV = process.env;

const delay = ms => new Promise(res => setTimeout(res, ms));
const port = ENV.ASSETMGMT_ASSETMGMT_PORT;
const AssetMgmtBaseRoute = 'http://localhost:' + port;
const HealthBaseRoute = '/assetmgmt/health';
const TestimonialBaseRoute = '/assetmgmt/testimonial';

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
    let postId;
    let testimonialId;

    const credentials = {
        email: "default.enterprise.owner@borqs.io",
        password: "Borqs@1234"
    };

    beforeEach(async () => {
        const response = await Request(AssetMgmtBaseRoute).post('/assetmgmt/user/login').send(credentials);
        expect(response.statusCode).toBe(200);
        enterpriseOwnerToken = response.body.data.token.token;
    });

    describe('PUT - create a testimonial', () => {
        it('should create a testimonial successfully', async () => {
            const testObject = {
                testimonialContent: "Testing for testimonial"
            };
            const response = await Request(AssetMgmtBaseRoute)
                .put(TestimonialBaseRoute).set('Authorization', `Bearer ${enterpriseOwnerToken}`)
                .send(testObject);
            expect(response.status).toBe(200);
            expect(response.body.message).toEqual("one testimonial created successfully");
            testimonialId = response.body.data._id;
        });

        it('should not create a testimonial if request body is empty or missing', async () => {
            const testObject = {};
            const response = await Request(AssetMgmtBaseRoute)
                .put(TestimonialBaseRoute).set('Authorization', `Bearer ${enterpriseOwnerToken}`)
                .send(testObject);
            expect(response.status).toBe(400);
        });
    });

    describe('GET - get a testimonial', () => {
        it('should get a testimonial successfully', async () => {
            const response = await Request(AssetMgmtBaseRoute)
                .get(TestimonialBaseRoute + `/${testimonialId}`)
            expect(response.status).toBe(200);
            expect(response.body.message).toEqual("one testimonial retrieved successfully by id");
        });

        it('should return an error while getting a testimonial not in our database', async () => {
            const testimonialWrongId = "668e530f958f71512ae962w2";
            const response = await Request(AssetMgmtBaseRoute)
                .get(TestimonialBaseRoute + `/${testimonialWrongId}`)
            expect(response.status).toBe(400);
        });

        it('should return an error while getting a testimonial when the testimonialId is empty or missing', async () => {
            const testimonialEmptyId = "";
            const response = await Request(AssetMgmtBaseRoute)
                .get(TestimonialBaseRoute + `/${testimonialEmptyId}`)
            expect(response.status).toBe(404);
        });
    });

    describe('POST - get all testimonials', () => {
        it('should get all testimonials successfully', async () => {
            const testObject = {
                condition: {
                    _id: ""
                },
                skip: "0",
                limit: "10"
            }
            const response = await Request(AssetMgmtBaseRoute)
                .post(TestimonialBaseRoute + `/search`).send(testObject)
            expect(response.status).toBe(200);
            expect(response.body.message).toEqual("testimonials retrieved successfully");
        });

        it('should get all relevant testimonials successfully', async () => {
            const testObject = {
                condition: {
                    _id: testimonialId
                },
                skip: "0",
                limit: "10"
            }
            const response = await Request(AssetMgmtBaseRoute)
                .post(TestimonialBaseRoute + `/search`).send(testObject)
            expect(response.status).toBe(200);
            expect(response.body.message).toEqual("testimonials retrieved successfully");
        });

        it('should return an empty array of testimonials while getting the testimonial id not in our database', async () => {
            const testObject = {
                condition: {
                    _id: "668f9ab53ca93dd7820bee85"
                },
                skip: "0",
                limit: "10"
            }
            const response = await Request(AssetMgmtBaseRoute)
                .post(TestimonialBaseRoute + `/search`).send(testObject)
            expect(response.status).toBe(200);
            expect(response.body.message).toEqual("testimonials retrieved successfully. no testimonials found with the search key");
        });

        it('should return an error if condition is missing', async () => {
            const testObject = {
                skip: "0",
                limit: "10"
            }
            const response = await Request(AssetMgmtBaseRoute)
                .post(TestimonialBaseRoute + `/search`).send(testObject)
            expect(response.status).toBe(400);
            expect(response.body.message).toEqual("Either invalid or no search condition found");
        });
    });
});