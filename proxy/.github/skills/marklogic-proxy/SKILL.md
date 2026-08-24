---
name: marklogic-proxy
description: 'Use when developing or debugging the proxy connection to MarkLogic: target protocol and port, database query parameters, REST requests, application-server routing, or proxy authentication handoff.'
argument-hint: 'Describe the MarkLogic target or proxied request behavior to change'
user-invocable: true
disable-model-invocation: false
---

# MarkLogic Proxy Integration

## Purpose

Use this skill for the boundary between the demo proxy and a MarkLogic application server. The proxy forwards all non-auth helper routes to the configured target and can append `TARGET_DATABASE` as a query parameter.

The proxy is used by the `ui/` application for search, document retrieval, alerts, and authentication-related requests. Preserve the HTTP method, path, query string, request body, response status, and response headers expected by that client.

## Configuration

- `TARGET_PROTOCOL` selects the target protocol and defaults to `http`.
- `TARGET_HOST` selects the target host and defaults to `localhost`.
- `TARGET_PORT` selects the application-server port and defaults to `8000`.
- `TARGET_DATABASE`, when set, is appended to every forwarded request as `database=<value>`.
- `TEST_TARGET_PORT` overrides the real target with the built-in local test server.

The proxy listens on `PROXY_PORT`; this is separate from `TARGET_PORT`. The UI must point `VITE_APP_PROXY_PORT` at the proxy port, not the MarkLogic port. A database value should be a MarkLogic database name and should be left unset when the target application server already has the desired database configured.

Keep the MarkLogic application-server port distinct from the proxy listening port. In the demo setup, the target is commonly the port exposed by the MarkLogic container for the configured application server.

## Request Flow

1. `app.all('*')` receives the UI request.
2. The configured database is appended without replacing existing query parameters.
3. `POST` and `PUT` bodies are buffered for possible Digest retry.
4. `proxy1` forwards the request to MarkLogic.
5. A `401` challenge is passed to `createDigest.js`; a valid Digest header is used by `proxy2` for the retry.

The first proxy handles the response itself. For non-`401` responses it collects the response body and writes it back to the browser; for `401`, it creates a second request using the original request and a Digest Authorization header.

## Change Rules

- Preserve the request URL, method, body, and content type when forwarding.
- Append database selection as a query parameter rather than embedding it in path text.
- Keep MarkLogic response status, headers, and body behavior compatible with the UI client.
- Preserve response formats used by MarkLogic REST endpoints, including JSON and multipart responses.
- Do not expose target credentials or complete sensitive MarkLogic documents in logs.
- Use the local test target to verify changes before relying on a live MarkLogic instance.

Do not silently rewrite MarkLogic paths or response payloads in this layer. Query-parameter changes should be explicit and limited to the configured `database` parameter.

## Validation

Start with `TEST_TARGET_PORT` and verify that GET and POST requests reach the test target, including existing query parameters. For live integration, confirm the configured application server accepts the request and that `TARGET_DATABASE` selects the intended database. Check both an initially authorized request and a `401` followed by a Digest retry. When changing a UI-facing request, also verify the corresponding UI flow rather than relying only on the test target's echo response.
