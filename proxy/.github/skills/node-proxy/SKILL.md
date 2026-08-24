---
name: node-proxy
description: 'Use when developing or debugging the Node.js Express proxy in the proxy folder: routes, request forwarding, body buffering, target configuration, CORS, errors, local test mode, or startup behavior.'
argument-hint: 'Describe the proxy route, request flow, or runtime behavior to change'
user-invocable: true
disable-model-invocation: false
---

# Node.js Proxy

## Purpose

Use this skill for the demo's Express and `http-proxy` service in `proxy/`. The service forwards browser traffic to MarkLogic, exposes authentication helper routes, and optionally starts an in-process test target.

The proxy is a small demo service rather than a general API gateway. Keep changes local to the request path being modified and preserve the contracts already consumed by the UI.

## Project Map

- `proxy/proxy.js`: Express routes, target selection, request forwarding, response handling, and the optional test server.
- `proxy/createDigest.js`: HTTP Digest challenge parsing and response-header generation.
- `proxy/.env_SAMPLE`: supported runtime configuration.
- `proxy/package.json`: runtime dependencies; there are no configured test or lint scripts.

The UI connects through `VITE_APP_PROXY_HOST` and `VITE_APP_PROXY_PORT` in `ui/.env`. The sample configuration uses `localhost:8091`, while the proxy itself defaults to port `8080`.

## Routes and Contracts

- `PUT /auth/in`: parse a JSON body containing non-empty `username` and `password`, cache both values in process memory, and return the username as plain text.
- `GET /auth/out`: clear both cached credentials and return a plain-text confirmation.
- `GET /auth/status`: return JSON with `authenticated` and, when authenticated, the cached username.
- `*`: forward all other methods and paths to the selected target.

Do not add an authentication middleware that changes these routes without checking the UI client first. CORS is currently enabled for browser requests.

## Working Procedure

1. Identify whether the change belongs to routing, target selection, request-body forwarding, response handling, authentication, or test mode.
2. Preserve the two-stage proxy flow: the first request detects `401`, and the second retries with Digest credentials.
3. Preserve request bodies for `POST` and `PUT` requests before invoking `proxy.web()`.
4. Keep `TEST_TARGET_PORT` behavior isolated from real MarkLogic configuration.
5. Return explicit HTTP errors without exposing credentials or sensitive target responses in logs.
6. Keep target database query-parameter handling before the proxy call.
7. Validate with a local smoke test using `TEST_TARGET_PORT` when the change affects forwarding.

## Constraints

- Do not commit `.env` or hard-code credentials.
- Do not log passwords, Authorization headers, or full sensitive document bodies.
- Preserve `/auth/in`, `/auth/out`, and `/auth/status` response contracts used by the UI.
- Do not treat the process-wide credential cache as per-user session storage.
- Do not introduce a health endpoint in documentation unless the implementation adds one.
- Avoid changing unrelated proxy behavior when editing a target-specific path.

## Validation

From `proxy/`, run:

```bash
TEST_TARGET_PORT=8092 TEST_INITIAL_UNAUTHORIZED=true PROXY_PORT=8091 node proxy.js
```

In another terminal, exercise a GET, a POST or PUT, and the auth routes with `curl`. Check the process output and HTTP status codes, including the initial `401` and the retry. Stop the server after the check. The package does not define automated test or lint commands.
