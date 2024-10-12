const Express = require('express');
const Router = Express.Router();
const fs = require('fs');
const path = require('path');

Router.get(
    '/', (req, res) => {
        let filePath = path.join(__dirname, '..', 'data', 'architecture', 'architecture.html');
        fs.readFile(filePath, function (err, data) {
            if (err) {
                res.status(500).send(err);
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write(data);
                return res.end();
            }
        })
    }
);

Router.get(
    '/terms-of-service', (req, res) => {
        let filePath = path.join(__dirname, '..', 'data', 'architecture', 'termsofservice.html');
        fs.readFile(filePath, function (err, data) {
            if (err) {
                res.status(500).send(err);
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write(data);
                return res.end();
            }
        })
    }
);

module.exports = Router;
