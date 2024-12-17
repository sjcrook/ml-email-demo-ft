const express = require('express');
const cors = require("cors");
const httpProxy = require('http-proxy');
const createDigest = require('./createDigest').default;
const http = require('http');

require('dotenv').config();

function getDT() {
    return (new Date()).toISOString();
}

const app = express();

app.use(cors({ origin: true }));

// Set defaults

const proxyServer = {
    port: process.env.PROXY_PORT || 8080
};

const realTargetServer = {
    protocol: process.env.TARGET_PROTOCOL || 'http',
    host: process.env.TARGET_HOST || 'localhost',
    port: process.env.TARGET_PORT || '8000',
    database: process.env.TARGET_DATABASE || undefined
};

const testTargetServer = {
    protocol: 'http',
    host: 'localhost',
    port: process.env.TEST_TARGET_PORT,
    database: undefined
}

const targetServer = process.env.TEST_TARGET_PORT ? testTargetServer : realTargetServer;

const auth = {
    type: 'DIGEST', // NONE, BASIC, DIGEST
    username: process.env.USERNAME || undefined,
    password: process.env.PASSWORD || undefined
};

/*
    Create 2 proxy servers.  If the first request returns with a 401, 
    the second proxy makes the same request but with digest credentials.
*/
const proxy1 = httpProxy.createProxyServer({});
const proxy2 = httpProxy.createProxyServer({});

const requestBody = { data: undefined };

proxy1.on('proxyReq', function(proxyReq, req, res, options) {
    //console.log('proxy1.on proxyReq');
    /*
        For some reason the body doesn't seem to be transferred from the original
        request to the proxy request so we formally add it
    */
    if ([ 'POST', 'PUT' ].includes(req.method)) {
        proxyReq.setHeader('Content-Length', Buffer.byteLength(requestBody.data));
        proxyReq.write(requestBody.data);
    }
});

proxy1.on('proxyRes', (proxyRes, req, res) => {
    /*
        Process the response from the target server.  If 401, create the digest and resubmit
        using proxy2.  Otherwise, return response to client.
    */
    //console.log('proxy1.on proxyRes');
    if (proxyRes.statusCode === 401) {
        console.log('statusCode === 401 so retrying with digest');
        const options = {
            target: targetServer,
            headers: {
                //'host': targetServer.host + ':' + targetServer.port
            }
        };
        const digest = createDigest({
            responseHeaders: proxyRes.headers,
            url: req.url,
            method: req.method,
            ...auth
        });
        if (digest !== false) {
            options.headers['Authorization'] = digest;
        }
        proxy2.web(req, res, options);
    } else {
        console.log('statusCode !== 401 so retrieving and returning response data');
        var body = [];
        proxyRes.on('data', (chunk) => {
            body.push(chunk);
        });
        proxyRes.on('end', function () {
            res.writeHead(proxyRes.statusCode, '- XYX -', proxyRes.headers);
            const bodyStr = Buffer.concat(body).toString();
            res.write(bodyStr);
            res.end();
        });
    }
});

proxy1.on('error', function (err, req, res) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('proxy1: Something went wrong in trying to call the target server.');
});

proxy2.on('proxyReq', (proxyReq, req, res) => {
    //console.log('proxy2.on proxyReq');
    /*
        For some reason the body doesn't seem to be transferred from the original
        request to the proxy request so we formally add it
    */
    if ([ 'POST', 'PUT' ].includes(req.method)) {
        proxyReq.setHeader('Content-Length', Buffer.byteLength(requestBody.data));
        proxyReq.write(requestBody.data);
    }
});

proxy2.on('proxyRes', (proxyRes, req, res) => {
    //console.log('proxy2.on proxyRes');
});

proxy2.on('error', function (err, req, res) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('proxy2: Something went wrong in trying to call the target server.');
});

app.put('/auth/in', (req, res) => {
    /*
         Route to 'logIn' 
         Cache credentials and add them to every request from the client (so the client doesn't
         have to attach credentials every time).
    */
    console.log(getDT() + ' :: /auth/in attempt');
    let body = [];
    req.on('data', (chunk) => {
        body.push(chunk);
    });
    req.on('end', () => {
        try {
            const creds = JSON.parse(Buffer.concat(body).toString());
            if (creds.username && creds.password) {
                auth.username = creds.username;
                auth.password = creds.password;                            
                res.writeHead(200, "OK", { "Content-Type": "text/plain" });
                res.write(creds.username);
                res.end();
            } else {
                res.writeHead(400, "Bad Request", { "Content-Type": "text/plain" });
                res.write("Invalid credentials");
                res.end();
            }
        } catch (e) {
            res.writeHead(400, "Bad Request");
            res.end();
        }
    });            
});

app.get('/auth/out', (req, res) => {
    /*
        Route to 'logOut'
        Destroy credentials
    */
    console.log(getDT() + ' :: /auth/out attempt');
    auth.username = undefined;
    auth.password = undefined;
    res.writeHead(200, "OK", { "Content-Type": "text/plain" });
    res.write("Credentials undefined");
    res.end();
});

app.get('/auth/status', (req, res) => {
    /*
        Route to determine credentials are cached or not.
    */
    console.log(getDT() + ' :: /auth/status attempt');
    res.writeHead(200, "OK", { "Content-Type": "application/json" });
    res.write(auth.username === undefined && auth.password === undefined ? JSON.stringify({ authenticated: false }) : JSON.stringify({ authenticated: true, username: auth.username }));
    res.end();
});

app.all('*', (req, res) => {
    /*
        General requests come through this route.
    */
    function makeProxyCall() {
        // Wrapper function since proxy request is called in two places below.
        proxy1.web(req, res, {
            target: targetServer,
            selfHandleResponse : true,
            headers: {
                //'host': targetServer.host + ':' + targetServer.port
                'connectin': 'close'
            }
        });
    }

    console.log(getDT() + ' :: * attempt, url: ', req.url);
    if (targetServer.database !== undefined) {
        /*
            If TARGET_DATABASE is specified in .env file, then append database
            to query string upon each request.
        */
        console.log('adding database to query string: ' + targetServer.database);
        const url = new URL(req.url, targetServer.protocol + '://' + targetServer.host + ':' + targetServer.port);
        url.searchParams.append('database', targetServer.database);
        req.url = url.pathname + url.search;
        console.log('new url: ' + req.url);
    }

    if ([ 'POST', 'PUT' ].includes(req.method)) {
        /*
            If the request is a POST or a PUT, get body or request
            and assign to requestBody.data.
        */
        const body = [];
        req.on('data', (chunk) => {
            body.push(chunk);
            //console.log('req.onData', chunk);
        });
        req.on('end', function () {
            const bodyStr = Buffer.concat(body); //.toString();
            //console.log('req.onEnd', bodyStr.toString());
            requestBody.data = bodyStr;
            makeProxyCall();
        });
    } else {
        makeProxyCall();
    }
});

app.listen(proxyServer.port, () => {
    console.log('Listening on port: ' + proxyServer.port);
});


if (process.env.TEST_TARGET_PORT) { 
    /*
        Create a test server that provides verbose logging of what's going on.
    */
    http.createServer((req, res) => {
        console.log('Test server received request.  Method: ' + req.method);
        if (req.method === 'GET') {
            if (process.env.TEST_INITIAL_UNAUTHORIZED === 'true' && !req.headers.hasOwnProperty('authorization')) {
                console.log('Test server set to 401 first request');
                res.writeHead(401, '- XYX -', { 'www-authenticate': 'Digest realm="public", qop="auth", nonce="3b8a2a2783bd84:gfnmgdVWe+OqlFQgsnfmDQ==", opaque="70a9e245654df572"' });
                res.write('unauthorized test');
                res.end();                
            } else {
                res.writeHead(200, '- XYX -', { 'Content-Type': 'text/plain' });
                res.write('method: GET\n');
                res.write('request successfully proxied to: ' + req.url + '\n' + JSON.stringify(req.headers, null, 4) + '\n');
                res.end();
            }
        } else if (req.method === 'POST') {
            if (process.env.TEST_INITIAL_UNAUTHORIZED === 'true' && !req.headers.hasOwnProperty('authorization')) {
                console.log('Test server set to 401 first request');
                res.writeHead(401, '- XYX -', { 'www-authenticate': 'Digest realm="public", qop="auth", nonce="3b8a2a2783bd84:gfnmgdVWe+OqlFQgsnfmDQ==", opaque="70a9e245654df572"' });
                res.write('unauthorized test');
                res.end();                
            } else {
                console.log('Test server responding to request');
                req.on('error', function (error) {
                    console.log('--THERE IS AN ERROR', error);
                });
                /*req.on('socket', function (socket) {
                    socket.setTimeout(1);  
                    socket.on('timeout', function() {
                        console.log('aborting');
                        req.abort();
                    });
                });*/
                /*res.writeHead(200, 'OK');
                res.write('this is the result');
                res.end();*/
                let body = [];
                req.on('data', (chunk) => {
                    console.log('req.on data', chunk);
                    body.push(chunk);
                });
                req.on('end', function () {
                    console.log('req.on end');
                    res.writeHead(200, '- XYX -', { 'Content-Type': 'text/plain' });
                    res.write('method: POST\n');
                    res.write('request successfully proxied to: ' + req.url + '\n' + JSON.stringify(req.headers, null, 4) + '\n');
                    const bodyStr = Buffer.concat(body).toString();
                    console.log('Test server sucessfully received body: ' + bodyStr);
                    res.write(bodyStr + '\n');
                    res.end();
                });
            }
        }
    }).listen(testTargetServer.port, () => {
        // Log URL.
        console.log("Test target server running at http://localhost:" + testTargetServer.port + "/");
    });
}