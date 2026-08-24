# MarkLogic Proxy

This directory contains the Node.js proxy used by the email demo UI. It forwards browser requests to MarkLogic, adds the configured database query parameter, and retries an unauthenticated response with an HTTP Digest authorization header.

## Prerequisites

- Node.js and npm
- A running MarkLogic instance, unless using the local test target
- MarkLogic credentials with access to the target database

The repository's normal startup order is:

1. Start MarkLogic with `docker compose up -d` from the repository root.
2. Deploy the data hub and load the demo data, as described in the root README.
3. Start this proxy.
4. Start the UI and open its `/signin` route.

## Start the proxy

```bash
cd proxy
cp .env_SAMPLE .env
npm install
node proxy.js
```

The proxy listens on `PROXY_PORT` (default `8080`). The UI should be configured to use the same host and port.

For the sample setup, the proxy uses port `8091`, matching the UI sample configuration:

```dotenv
VITE_APP_PROXY_HOST=localhost
VITE_APP_PROXY_PORT=8091
```

These variables belong in `ui/.env`, not in this directory's `.env` file.

## Configuration

Copy `.env_SAMPLE` to `.env` and adjust the values:

| Variable | Default | Description |
| --- | --- | --- |
| `PROXY_PORT` | `8080` | Port exposed by this proxy. |
| `TARGET_PROTOCOL` | `http` | Protocol for the MarkLogic target. |
| `TARGET_HOST` | `localhost` | MarkLogic host name. |
| `TARGET_PORT` | `8000` | MarkLogic application server port. |
| `TARGET_DATABASE` | unset | Database name appended as the `database` query parameter. |
| `USERNAME` | unset | Initial MarkLogic username used for Digest authentication. |
| `PASSWORD` | unset | Initial MarkLogic password used for Digest authentication. |
| `TEST_TARGET_PORT` | unset | Enables the local test target on this port instead of MarkLogic. |
| `TEST_INITIAL_UNAUTHORIZED` | `true` | Makes the test target return `401` before an authenticated retry. |

When `TEST_TARGET_PORT` is set, the proxy targets `http://localhost:$TEST_TARGET_PORT` and starts an in-process test server. In that mode, `TARGET_*` values are ignored. If `TARGET_DATABASE` is not needed, leave it unset or remove it from `.env`.

## Routes

- `PUT /auth/in` accepts `{ "username": "...", "password": "..." }`, caches the credentials in memory, and returns the username.
- `GET /auth/out` clears the cached credentials.
- `GET /auth/status` returns `{ "authenticated": true, "username": "..." }` or `{ "authenticated": false }`.
- All other requests are forwarded to the configured target.

For `POST` and `PUT` requests, the proxy buffers the body so it can be sent again if the first target request returns `401`.

## Request flow

1. The first request is sent without an Authorization header.
2. A `401` response is parsed for the Digest challenge.
3. `createDigest.js` builds the Digest header from the challenge, request method, URL, and cached credentials.
4. The request is retried through the second proxy client.
5. Non-`401` responses are returned to the caller.

## Local smoke test

Use a separate terminal:

```bash
TEST_TARGET_PORT=8092 TEST_INITIAL_UNAUTHORIZED=true PROXY_PORT=8091 node proxy.js
```

Then exercise the proxy:

```bash
curl -i http://localhost:8091/
curl -i -X PUT http://localhost:8091/auth/in \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"password"}'
curl -i http://localhost:8091/auth/status
curl -i http://localhost:8091/auth/out
```

The test target also accepts a body-bearing request, which checks the buffering and retry path:

```bash
curl -i -X POST http://localhost:8091/test \
  -H 'Content-Type: application/json' \
  -d '{"message":"proxy smoke test"}'
```

The expected forwarding response includes the method, request URL, headers, and request body. With `TEST_INITIAL_UNAUTHORIZED=true`, the first target request returns `401`; the retry succeeds only when valid credentials have been supplied through `PUT /auth/in` or the initial environment variables.

Stop the process with `Ctrl+C` when finished.

## Troubleshooting

- **Connection refused:** Confirm the proxy is running and that the UI port matches `PROXY_PORT`.
- **MarkLogic connection errors:** Check `TARGET_PROTOCOL`, `TARGET_HOST`, and `TARGET_PORT`. `TARGET_PORT` must be the MarkLogic application-server port, not necessarily the port used by the proxy.
- **Unexpected database results:** Check `TARGET_DATABASE` and confirm that the selected database is available to the target application server.
- **Repeated `401` responses:** Confirm the credentials are correct and that the target returns a Digest challenge containing a `nonce`.
- **Body missing after retry:** Reproduce with the local test target and a POST or PUT request, then inspect the proxy and test-target logs without enabling credential or payload logging.

There is no health-check route. A simple `GET /` request is the supported connectivity check when the local test target is enabled.

## Security notes

- `.env` contains credentials and must remain uncommitted.
- Credentials are held in process memory and are shared by all clients of the proxy.
- Use a trusted network and HTTPS for environments where credentials or document data require protection.
- Do not log passwords, Authorization headers, or full sensitive request bodies.
- This proxy is intended for the demo workflow and is not an access-control boundary.

## Known limitations

- Credentials are global to the Node.js process, so separate users cannot maintain independent sessions.
- Credentials are stored only in memory and are lost when the process restarts.
- The Digest implementation is tailored to the challenge format used by this demo; it is not a general-purpose authentication library.
- The proxy currently buffers request bodies only for `POST` and `PUT` requests.
