require('dotenv').config();
const Request = require('supertest');
let NotificationServer;
let isAlreadyRunning = true;

const ENV = process.env;

const delay = ms => new Promise(res => setTimeout(res, ms));
const port = ENV.ASSETMGMT_NOTIFICATION_PORT;
const NotificationBaseRoute = 'http://localhost:' + port;
const NotificationRoute = '/notification';
const HealthBaseRoute = '/notification/health';

beforeAll(async () => {
    try {
        let response = await Request(NotificationBaseRoute).get(HealthBaseRoute);
        if (response.body.code == 200 && (response.body.message = 'healthy')) {
            isAlreadyRunning = true;
            console.log('server already running');
            NotificationServer = null;
        } else {
            isAlreadyRunning = false;
            console.log('starting server now');
            require('../index');
            NotificationServer = require('../bin/notification');
            require('../routes/controllers/notification');
            require('../routes/helpers/notification');
            await delay(15000);
        }
    } catch (e) {
        isAlreadyRunning = false;
        console.log(e + ' - starting server now');
        NotificationServer = require('../bin/notification');
        await delay(15000);
    }
}, 30000);

afterAll(async () => {
    if (!isAlreadyRunning) {
        NotificationServer.close();
    }
});

let phone = {
    cc: "+91",
    number: "8619032268"
};
let email = "mithun.k@borqs.com";
let type = 'login';
let otp = '1234';

describe("GET - health of the server", ()=>{
    it("should return health of the server", async ()=> {
        const response = await Request(NotificationBaseRoute).get(NotificationRoute + '/health');
        expect(response.statusCode).toBe(200);
        expect(response._body.message).toBe("Healthy");
    })
})

describe('POST - send notification', () => {
    it('should send sms notification successfully', async () => {
        const response = await Request(NotificationBaseRoute)
            .post(NotificationRoute + '/sms')
            .send({ phone: phone, type: type, otp: otp });
        expect(response.status).toBe(200);
        expect(response.body.code).toEqual(200);
    });
});

describe('POST - fail to send notification with no phone number passed', () => {
    it('should fail to send sms notification', async () => {
        const response = await Request(NotificationBaseRoute)
            .post(NotificationRoute + '/sms')
            .send({ type: type, otp: otp });
        expect(response.status).toBe(400);
        expect(response.body.code).toEqual(400);
    });
});

describe('POST - fail to send notification with no type passed', () => {
    it('should fail to send sms notification', async () => {
        const response = await Request(NotificationBaseRoute)
            .post(NotificationRoute + '/sms')
            .send({ phone: phone, otp: otp });
        expect(response.status).toBe(400);
        expect(response.body.code).toEqual(400);
    });
});

describe('POST - fail to send notification with invalid phone number format', ()=> {
    it('should fail to send sms notification', async ()=>{
        let phone = {
            cc: "",
            number: ""
        }
        const response = await Request(NotificationBaseRoute).post(NotificationRoute + '/sms').send(
            {phone: phone, type: type, otp: otp}
        );
        expect(response.status).toBe(400);
        expect(response.body.code).toEqual(400);
    })
})

describe('POST - fail to send notification with empty message', () => {
    it('should fail to send sms notification', async () => {
        let otp = "";
        const response = await Request(NotificationBaseRoute).post(NotificationRoute + '/sms').send(
            { phone: phone, type: type, otp: otp }
        );
        expect(response.status).toBe(400);
        expect(response.body.code).toEqual(400);
    })
})

describe('POST - fail to send notification with empty message', () => {
    it('should fail to send sms notification', async () => {
        let phone = {};
        let otp = "";
        const response = await Request(NotificationBaseRoute).post(NotificationRoute + '/sms').send(
            { phone: phone, type: type, otp: otp }
        );
        expect(response.status).toBe(400);
        expect(response.body.code).toEqual(400);
    })
})

describe('POST - fail to send notification with incorrect phone number', () => {
    it('should fail to send sms notification', async () => {
        let phone = {
            cc: "xyz",
            number: "asdfgerty"
        }
        const response = await Request(NotificationBaseRoute).post(NotificationRoute + '/sms').send(
            { phone: phone, type: type, otp: otp }
        );
        expect(response.status).toBe(400);
        expect(response.body.code).toEqual(400);
    })
})


describe('POST - send email notification with valid email address ', () => {
    it('should send email notification successfully', async () => {
        const response = await Request(NotificationBaseRoute)
            .post(NotificationRoute + '/email')
            .send({ email: email, type: type, otp: otp });
        expect(response.status).toBe(200);
        expect(response.body.code).toEqual(200);
    });
});

describe('POST - send email notification with invalid email address', () => {
    it('should fail to send the email', async () => {
        let email = 1234567;
        const response = await Request(NotificationBaseRoute)
            .post(NotificationRoute + '/email')
            .send({ email: email, type: type, otp: otp });
        expect(response.status).toBe(400);
        expect(response.body.code).toEqual(400);
    });
});

describe('POST - send email notification with empty email, otp and type', () => {
    it('should fail to send the email', async () => {
        let email = "";
        let otp = "";
        let type = "";
        const response = await Request(NotificationBaseRoute)
            .post(NotificationRoute + '/email')
            .send({ email: email, type: type, otp: otp });
        expect(response.status).toBe(400);
        expect(response.body.code).toEqual(400);
    });
});

describe('POST - send email notification', () => {
    it('should fail to send the email', async () => {
        let type = "";
        const response = await Request(NotificationBaseRoute)
            .post(NotificationRoute + '/email')
            .send({ email: email, type: type, otp: otp });
        expect(response.status).toBe(400);
        expect(response.body.code).toEqual(400);
    });
});

describe('POST - send email notification with no otp', () => {
    it('should fail to send the email', async () => {
        let otp = "";
        const response = await Request(NotificationBaseRoute)
            .post(NotificationRoute + '/email')
            .send({ email: email, type: type, otp: otp });
        expect(response.status).toBe(400);
        expect(response.body.code).toEqual(400);
    });
});

describe('POST - send email notification with no email', () => {
    it('should fail to send the email', async () => {
        let email = "";
        const response = await Request(NotificationBaseRoute)
            .post(NotificationRoute + '/email')
            .send({ email: email, type: type, otp: otp });
        expect(response.status).toBe(400);
        expect(response.body.code).toEqual(400);
    });
});

describe('POST - send email notification with non-existing email', () => {
    it('should fail to send the email', async () => {
        let email = "abc@example.com";
        const response = await Request(NotificationBaseRoute)
            .post(NotificationRoute + '/email')
            .send({ email: email, type: type, otp: otp });
        expect(response.status).toBe(400);
        expect(response.body.code).toEqual(400);
    });
});

describe('POST - send email notification with an array of emails', () => {
    it('should send emails to all the recipient', async () => {
        let email = ["abc@example.com", "mithun.kumar@programming.com"];
        const response = await Request(NotificationBaseRoute)
            .post(NotificationRoute + '/email')
            .send({ email: email, type: type, otp: otp });
        expect(response.status).toBe(200);
        expect(response.body.code).toEqual(200);
    });
});