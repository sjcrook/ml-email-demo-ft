"use strict";

const crypto = require("crypto");
const url = require("url");

/*
    Create a digest header from the data passed in.

    opts = {
        responseHeaders: {},
        url: '/a/b/c',
        method: 'GET',
        username: '',
        password: ''
    }
*/
function createDigest(opts) {
    let count = 0;
    let _a, _b;

    if (!((_a = opts.responseHeaders["www-authenticate"]) === null || _a === void 0 ? void 0 : _a.includes('nonce'))) {
        return false;
    }
    const authDetails = opts.responseHeaders['www-authenticate'].replace(/, /g, ',').split(',').map(item => {
        const eqPos = item.indexOf('=');
        return [ item.substring(0, eqPos), item.substring(eqPos + 1) ];
    });
    count;
    const nonceCount = ('00000000' + count).slice(-8);
    const cnonce = crypto.randomBytes(24).toString('hex');
    const realm = authDetails.find((el) => el[0].toLowerCase().indexOf("realm") > -1)[1].replace(/"/g, '');
    const nonce = authDetails.find((el) => el[0].toLowerCase().indexOf("nonce") > -1)[1].replace(/"/g, '');
    const opaque = authDetails.find((el) => el[0].toLowerCase().indexOf("opaque") > -1)[1].replace(/"/g, '');
    const ha1 = crypto.createHash('md5').update(`${opts.username}:${realm}:${opts.password}`).digest('hex');
    const path = url.parse(opts.url).pathname;
    const ha2 = crypto.createHash('md5').update(`${(_b = opts.method) !== null && _b !== void 0 ? _b : "GET"}:${path}`).digest('hex');
    const response = crypto.createHash('md5').update(`${ha1}:${nonce}:${nonceCount}:${cnonce}:auth:${ha2}`).digest('hex');
    return `Digest username="${opts.username}",realm="${realm}",` +
        `nonce="${nonce}",uri="${path}",cnonce="${cnonce}",nc="${nonceCount}",qop="auth",` + //,algorithm="MD5",` +
        `response="${response}",opaque="${opaque}"`;
}

exports.default = createDigest;