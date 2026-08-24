---
name: marklogic
description: 'Use when developing or debugging MarkLogic integration in the ui project: MarkLogicContext, search, collections, facets, document retrieval, cts queries, SPARQL, alerts, REST requests, response mapping, or authentication.'
argument-hint: 'Describe the MarkLogic query, data flow, or behavior to change'
user-invocable: true
disable-model-invocation: false
---

# MarkLogic Integration

## Purpose

Use this skill for MarkLogic data access in the `ui/` project. The React application uses `ml-fasttrack` and `MarkLogicContext` for the main search and document workflow, with Axios available for calls outside that context.

## When to Use

- Add or change full-text search, collection selection, or pagination.
- Add or change string or range facet constraints.
- Retrieve, transform, or render a MarkLogic document.
- Work with alert documents or related document references.
- Add or change `cts` JavaScript requests sent to `/v1/eval`.
- Add or change SPARQL requests or relationship graph data.
- Debug MarkLogic request URLs, payloads, response shapes, or auth behavior.

## Project Map

- `src/pages/SearchPage.tsx`: search controls, facets, results, document retrieval, and graph integration.
- `src/pages/AlertsPage.tsx`: alert retrieval through `MarkLogicContext` and `/v1/eval`.
- `src/components/NetworkGraphSPARQL.tsx`: SPARQL request and graph response mapping.
- `src/components/AlertGraphTimeline.tsx`: alert-related document query and timeline data.
- `src/services/api-client.ts`: Axios client for non-FastTrack calls.
- `src/config/SearchBox.config.js`: search-box options and MarkLogic collections.
- `src/entities/`: TypeScript models for auth, notifications, and search responses.
- `src/utils/dataTransform.ts`: raw response transformation.
- `src/utils/renderUtilities.tsx`: document and snippet rendering.
- `src/hooks/useAuth.ts` and `src/store/useAuthStore.ts`: authentication state and flow.
- `src/routes.tsx` and `src/pages/AuthenticatedPages.tsx`: protected application routes.

## Working Procedure

1. Identify the owning UI page, component, service, configuration, or entity model.
2. Trace the request from the user action through `MarkLogicContext`, `api-client.ts`, or the auth hook.
3. Reuse existing FastTrack context methods before adding a raw request.
4. Preserve the configured collections and existing constraint names unless the requirement changes them.
5. Type the response boundary and keep transformations in utilities or services when reused.
6. Handle loading, empty, malformed, unauthorized, and request-error states explicitly.
7. Preserve `AuthenticatedPages` and use `useAuth()` for protected MarkLogic operations.
8. Validate with lint and a production build from `ui/`, then manually verify the affected request flow.

## MarkLogicContext Patterns

The existing FastTrack context exposes these patterns:

- `setQtext(query)` sets the search text.
- `setCollections(collections)` applies collection filters.
- `addStringFacetConstraint()` applies string facet filters.
- `addRangeFacetConstraint()` and `removeRangeFacetConstraint()` manage date or range filters.
- `searchResponse` contains the current search response.
- `getDocument(uri)` requests one document.
- `documentResponse` contains the current document response.
- `request({ url, method, ... })` sends specialized REST requests.
- `postSparql(query, bindings)` sends a SPARQL request used by the relationship graph.

The main search page uses `useContext(MarkLogicContext)` and delegates search behavior to `ml-fasttrack` components:

- `SearchBox` calls `setQtext()` and `setCollections()` from its `onSearch` handler.
- `StringFacet` calls `addStringFacetConstraint(selection)`.
- `DateRangeFacet` calls `addRangeFacetConstraint()` or `removeRangeFacetConstraint()` and keeps the selected range in local state.
- `ResultsCustom` consumes `searchResponse.results` and delegates result rendering to `src/utils/customResultRender.tsx`.
- `WindowCard` displays `documentResponse`; its close handler calls `setDocumentResponse(null)`.
- The initial search calls `setPageStart(1)` followed by `postSearch(context.qtext, 1)` when the response is empty.

The configured search collections are:

- `/type/emails`
- `/type/transcripts`
- `/type/trades`

The configured search filters include Broker, keyword, email sender, email recipient, sender and recipient first names, transcript speaker, and date range. `Broker` is a trade-only string facet backed by the `/trade/Broker` path-range index and the `Broker` constraint in `datahub/src/main/ml-modules/options/all.xml`.

The collection selector is defined in `src/config/SearchBox.config.js`. Each menu item has a `label` and an array-valued `value` containing one or more collection URIs. Current options are `All Entities`, `Emails`, `Transcripts`, and `Trades`.

## Request Formats

Use the existing request boundary for each kind of operation:

| Operation | Existing UI boundary | Endpoint or method |
| --- | --- | --- |
| Search and document retrieval | `MarkLogicContext` | FastTrack context methods |
| Alert lookup | `context.request()` | `POST /v1/eval` |
| Relationship graph | `context.postSparql()` | FastTrack SPARQL method |
| Sign-in and sign-out | `APIClient` | `PUT /auth/in`, `GET /auth/out` |
| Authentication probe | `APIClient` | `GET /v1/search` |

Alert evaluation currently sends a JavaScript expression using `cts.search(cts.collectionQuery("alerts"))` with `Content-Type: application/x-www-form-urlencoded` and accepts `multipart/mixed; boundary=BOUNDARY`. Preserve that contract when changing alert loading.

`src/services/api-client.ts` creates an Axios client with a base URL assembled from `APP_CONFIG.APP_PROXY_HOST` and `APP_CONFIG.APP_PROXY_PORT`. Its `get`, `post`, and `put` methods are the established non-FastTrack request helpers.

## SPARQL Graph Pattern

`src/components/NetworkGraphSPARQL.tsx` sends a query object with `qtext: ''` and a `sparql` string to `context.postSparql()`. It binds `transcriptURI` to the selected document URI with the `http://marklogic.com` prefix and maps `response.results.bindings` into the graph format consumed by `NetworkGraph`.

When changing this flow:

- Keep the selected document guard before sending the request.
- Preserve the binding name expected by the query.
- Handle an absent response or empty bindings without attempting to render graph nodes.
- Keep URI normalization consistent with the current implementation.
- Do not expose raw query failures or sensitive document content in logs.

## Alert Data Flow

`src/pages/AlertsPage.tsx` parses the multipart `/v1/eval` response using the `BOUNDARY` marker, extracts each alert URI and JSON payload, then resolves the source trade with `context.getDocument(item.alert.URI)`. It derives email and transcript counts from `referringDocs` and passes the alert URI to `AlertGraphTimeline` when the user opens an alert.

Preserve these behaviors when modifying alerts:

- Keep alert collection selection as `alerts`.
- Expect `triggerWords`, `URI`, and `referringDocs` in the normalized alert data.
- Treat related document arrays and source trade fields as optional at the UI boundary.
- Clear the shared document response before opening or closing the alert dialog when the existing flow does so.

## Query and Request Rules

- Use FastTrack components and `MarkLogicContext` for the primary search workflow.
- Keep `cts` and SPARQL construction out of page markup when the logic is reusable or complex.
- Preserve the request endpoint and payload format used by the existing feature.
- Treat URIs as data; do not concatenate untrusted values into query text without using the project’s binding or escaping pattern.
- Do not log credentials, authorization headers, or full sensitive document contents.
- Map MarkLogic response fields defensively because result, facet, alert, and SPARQL binding shapes may be incomplete.
- Keep domain interfaces in `src/entities/` instead of scattering anonymous response types through components.
- Use the local `SearchBox.config.js` collection values rather than inventing collection names.
- Preserve MarkLogic request headers and response parsing when working with `/v1/eval` or SPARQL.
- Prefer bindings for variable values; do not build query text by concatenating untrusted input.

## Alert and Graph Flows

The alerts page retrieves alert documents through a MarkLogic request and resolves related information for display. Alert data may reference a source trade URI and related email or transcript documents.

The relationship graph sends a transcript-specific SPARQL query through the FastTrack context and maps returned bindings into graph nodes and links. It must only mount for `/transcripts/` URIs; trade and email documents do not provide the RDF bindings expected by `NetworkGraphSPARQL.tsx`. Preserve the empty graph state and avoid rendering a graph before its response is available.

## Validation

Run these commands from `ui/`:

```bash
npm run lint
npm run build
```

There is no configured test framework in `package.json`. Manually verify the relevant search, facet, document, alert, or graph flow with valid and empty results, request errors, and unauthenticated access where applicable.
