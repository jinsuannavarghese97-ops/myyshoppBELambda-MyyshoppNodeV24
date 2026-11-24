'use strict';
// LOCAL DEVELOPMENT ONLY - not used by the Lambda deployment (index.js never requires this file).
// Stand-in for API Gateway + Lambda: serves HTTP requests on localhost and passes the JSON body to exports.handler
// as the event (the same way the API Gateway integration does). The database connection details come from the
// DB_* values in .env instead of AWS Secrets Manager; index.js itself is not modified.
//
// Run:  npm run start:local        (default: http://localhost:4001/myyshopp)
const http = require('http');
const path = require('path');
const Module = require('module');

try { process.loadEnvFile(path.join(__dirname, '.env')); } catch (e) { console.warn('[local] .env not loaded:', e.message); }

const missing = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'].filter(function (k) { return !process.env[k]; });
if (missing.length) { console.error('[local] Missing in .env: ' + missing.join(', ')); process.exit(1); }

// index.js reads the DB connection secret through @aws-sdk/client-secrets-manager. Serve it from .env instead.
const secretString = JSON.stringify({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    dbname: process.env.DB_NAME
});
class SecretsManagerClient { send() { return Promise.resolve({ SecretString: secretString }); } }
class GetSecretValueCommand { constructor(input) { this.input = input; } }
const originalLoad = Module._load;
Module._load = function (request) {
    if (request === '@aws-sdk/client-secrets-manager') return { SecretsManagerClient: SecretsManagerClient, GetSecretValueCommand: GetSecretValueCommand };
    return originalLoad.apply(this, arguments);
};

process.env.AWS_REGION = process.env.AWS_REGION || 'ap-south-1';
const handler = require('./index.js').handler;

const PORT = Number(process.env.LOCAL_PORT) || 4001;
const BASE_PATH = '/myyshopp';

function send(res, status, body) {
    res.writeHead(status, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': 'POST,GET,OPTIONS'
    });
    res.end(JSON.stringify(body));
}

http.createServer(function (req, res) {
    if (req.method === 'OPTIONS') return send(res, 204, '');
    if (req.method === 'GET') return send(res, 200, { status: 'ok', service: BASE_PATH.slice(1), database: process.env.DB_NAME });
    let raw = '';
    req.on('data', function (c) { raw += c; });
    req.on('end', function () {
        let event;
        try { event = raw ? JSON.parse(raw) : {}; } catch (e) { return send(res, 400, { message: 'Request body is not valid JSON' }); }
        const context = {
            callbackWaitsForEmptyEventLoop: false,
            functionName: 'local' + BASE_PATH.replace('/', '-'),
            awsRequestId: 'local-' + Date.now(),
            getRemainingTimeInMillis: function () { return 30000; }
        };
        Promise.resolve()
            .then(function () { return handler(event, context); })
            .then(function (result) { send(res, 200, result === undefined ? null : result); })
            .catch(function (err) { console.error('[local] handler error:', err); send(res, 502, { message: String(err && err.message || err) }); });
    });
}).listen(PORT, function () {
    console.log('[local] ' + BASE_PATH + ' listening on http://localhost:' + PORT + BASE_PATH + '  (database: ' + process.env.DB_NAME + ' @ ' + process.env.DB_HOST + ')');
});
