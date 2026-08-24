---
name: marklogic-fasttrack
description: 'Use when developing or debugging the MarkLogic FastTrack UI: search, collections, facets, document retrieval, alerts, SPARQL relationship graphs, authentication, or related React and TypeScript changes.'
argument-hint: 'Describe the FastTrack UI feature or behavior to change'
user-invocable: true
disable-model-invocation: false
---

# MarkLogic FastTrack UI

## Purpose

Use this skill for FastTrack integration work in the `ui/` project. The application is a React 18 and TypeScript frontend built with Vite and `ml-fasttrack`. It searches email, transcript, and trade data, displays facets and documents, renders relationship graphs, and presents alerts.

## When to Use

- Add or change FastTrack search behavior, collections, facets, pagination, or result rendering.
- Retrieve or render a selected MarkLogic document.
- Change alert loading, alert details, or related timelines.
- Change SPARQL-powered relationship graph integration.
- Change sign-in, sign-out, authentication state, or protected routes.
- Debug the UI data flow between FastTrack components, context state, and services.

## Project Map

- `src/pages/SearchPage.tsx`: search controls, facets, results, document preview, and graph tab.
- `src/pages/AlertsPage.tsx`: alert retrieval, related trade data, and alert dialog.
- `src/pages/SignIn.tsx`: authentication form and initial target-service check.
- `src/pages/AuthenticatedPages.tsx`: authenticated route guard.
- `src/routes.tsx`: `/signin`, `/app/search`, and `/app/alerts` routes.
- `src/components/NetworkGraphSPARQL.tsx`: SPARQL request and graph mapping.
- `src/components/AlertGraphTimeline.tsx`: alert-related data and graph/timeline presentation.
- `src/components/TimelineEmailSearch.tsx`: search-result timeline.
- `src/services/api-client.ts`: Axios boundary for non-FastTrack requests.
- `src/config/SearchBox.config.js`: search menu labels and collection arrays.
- `src/entities/`: shared TypeScript models.
- `src/utils/`: response transformation, result rendering, and document rendering.
- `src/hooks/useAuth.ts` and `src/store/`: authentication and notification state.

## FastTrack Components and Context

The main search page uses `useContext(MarkLogicContext)` and delegates data access to `ml-fasttrack` components and context methods:

- `SearchBox` calls the page search handler, which calls `setQtext()` and `setCollections()`.
- `StringFacet` applies string constraints with `addStringFacetConstraint()`.
- `DateRangeFacet` applies or removes range constraints with `addRangeFacetConstraint()` and `removeRangeFacetConstraint()`.
- `ResultsCustom` consumes `searchResponse.results` and uses `customResultRender` for each item.
- `WindowCard` displays `documentResponse` with Document and Graph tabs.
- `DataGrid` renders the alert list.
- `NetworkGraph` renders graph items prepared by the graph components.

Relevant context methods and values include:

- `setQtext(query)` and `setCollections(collections)` for search state.
- `setPageStart(page)` and `postSearch(qtext, page)` for the initial search flow.
- `searchResponse` for facets and result records.
- `getDocument(uri)` and `documentResponse` for document inspection.
- `setDocumentResponse(null)` to clear the selected document.
- `request({ url, method, ... })` for specialized requests such as alert evaluation.
- `postSparql(query, bindings)` for relationship graph data.

## Search and Collection Conventions

The configured search collections are:

- `/type/emails`
- `/type/transcripts`
- `/type/trades`

The configured filters are Broker, keyword, email sender, email recipient, sender and recipient first names, transcript speaker, and date range. Broker values come from `trade.Broker`; the `Broker` facet requires the `/trade/Broker` MarkLogic path-range index and the `Broker` search constraint in the Data Hub options. The initial date range in `SearchPage.tsx` is `1980` through `2030`.

The search menu is defined in `src/config/SearchBox.config.js`. Each item has a label and an array-valued collection `value`. Current labels are `All Entities`, `Emails`, `Transcripts`, and `Trades`; preserve this shape when changing search scopes.

## Data Flow

1. `SearchBox` sends query text and collection selection to the search page.
2. The page updates context state with `setQtext()` and `setCollections()`.
3. An empty initial response triggers `setPageStart(1)` and `postSearch(context.qtext, 1)`.
4. Facet components update context constraints; the date range is also kept in local component state.
5. `ResultsCustom` renders search results. Selecting a result calls `getDocument(uri)`.
6. `WindowCard` renders the selected document and result selection resets its tab to `Document`. Closing it calls `setDocumentResponse(null)`.
7. The Graph tab calls the SPARQL graph component only for transcript documents. The current SPARQL graph query is transcript-specific and must not mount for trade or email documents.

## Request Boundaries

- Keep normal search and document retrieval in `MarkLogicContext` and FastTrack components.
- Keep alert evaluation in `context.request()` using the existing `POST /v1/eval` request and `cts.search(cts.collectionQuery("alerts"))` expression.
- Keep relationship graph requests in `context.postSparql()`.
- Use `src/services/api-client.ts` for the existing authentication and non-FastTrack requests rather than adding duplicate Axios clients.
- Preserve the alert `multipart/mixed; boundary=BOUNDARY` response contract and its parsing behavior.

## Agent Workflow

1. Find the owning page, component, service, configuration file, or entity model.
2. Trace the existing request and state flow before changing an API shape.
3. Reuse FastTrack components and context methods before introducing raw requests.
4. Keep reusable query or response transformation logic in services or utilities.
5. Type shared response models in `src/entities/` and handle optional response fields.
6. Preserve the authentication guard and use `useAuth()` for auth state.
7. Handle loading, empty, malformed, unauthorized, and request-error states.
8. Run lint and build from `ui/`, then manually verify the affected flow.

## Safety Rules

- Preserve the existing collection names and constraint names unless the requirement changes them.
- Use bindings or the local escaping pattern for URI and query values; do not interpolate untrusted input into `cts` or SPARQL text.
- Do not log credentials, authorization headers, full documents, or raw sensitive request payloads.
- Preserve the response shapes expected by `ResultsCustom`, `renderDocument`, `customResultRender`, and `NetworkGraph`.
- Avoid changing the local `ml-fasttrack-1.1.0-ea.tgz` package unless explicitly required.

## Validation

Run these commands from `ui/`:

```bash
npm run lint
npm run build
```

There is no configured test framework in `package.json`. Manually verify search, facets, document selection and closing, graph loading, alert loading, and unauthenticated access when relevant.
