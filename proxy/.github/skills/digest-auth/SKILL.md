---
name: digest-auth
description: 'Use when developing or debugging HTTP Digest authentication in the proxy: 401 challenges, nonce and realm parsing, MD5 response construction, cached credentials, or authenticated request retries.'
argument-hint: 'Describe the Digest challenge or authentication retry behavior to change'
user-invocable: true
disable-model-invocation: false
---

# Digest Authentication

## Purpose

Use this skill for `createDigest.js` and the Digest retry path in `proxy.js`. The target server is contacted once without credentials; after a `401`, the challenge is converted into an Authorization header and the original request is retried.

This implementation supports the Digest challenge shape used by the demo's MarkLogic target. It is not a replacement for a maintained authentication library or a complete implementation of every Digest RFC option.

## Digest Contract

`createDigest()` expects:

- `responseHeaders`: response headers containing `www-authenticate` with at least a `nonce`.
- `url`: the original request URL.
- `method`: the original HTTP method, defaulting to `GET` inside the digest calculation.
- `username` and `password`: cached credentials.

The current implementation uses the challenge `realm`, `nonce`, and `opaque`, `qop="auth"`, an eight-digit nonce count, a random client nonce, and MD5 hashes for `HA1`, `HA2`, and the final response.

Conceptually, it calculates:

```text
HA1 = MD5(username:realm:password)
HA2 = MD5(method:path)
response = MD5(HA1:nonce:nc:cnonce:qop:HA2)
```

The generated header contains the username, realm, nonce, path, client nonce, nonce count, quality of protection, response, and opaque value.

## Working Rules

- Preserve the original method and request path in the retry.
- Return `false` when the challenge does not contain a nonce so the caller can avoid constructing an invalid header.
- Confirm that required challenge fields such as `realm`, `nonce`, and `opaque` are present before dereferencing them; optional Digest directives must not crash the proxy.
- Keep credentials in memory only and never log them or the generated Authorization header.
- Treat challenge parsing as untrusted input and avoid assuming optional fields are present.
- Preserve request bodies across a retry for `POST` and `PUT` requests.
- Keep the request path used for the hash aligned with the URI sent on the retry, including any intentional query parameters.
- Avoid retry loops: a failed Digest retry should be returned as an error rather than triggering an unbounded second challenge cycle.
- Do not describe MD5 Digest authentication as suitable for modern security requirements; prefer HTTPS and a stronger supported authentication design for production systems.

Changing nonce-count handling, challenge parsing, or URI normalization can invalidate authentication even when the username and password are correct. Test against both the built-in challenge and a real MarkLogic challenge before changing these details.

## Validation

Run the built-in test target with `TEST_INITIAL_UNAUTHORIZED=true`. Verify that the first request returns `401`, the retry succeeds when credentials are configured, and requests without a valid challenge do not generate a malformed header. Also verify GET and body-bearing POST or PUT requests. Test missing credentials and malformed or incomplete `www-authenticate` headers without printing secrets.
