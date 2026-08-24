# MarkLogic Email Intelligence UI

This is a Vite + React + TypeScript application built with MarkLogic FastTrack. It provides an interface for searching email, transcript, and trade data, inspecting documents, viewing relationship graphs, and reviewing alerts.

## Technology

- React 18 with React Router 6
- Vite and TypeScript
- `ml-fasttrack` for MarkLogic search and document access
- KendoReact components and Kendo themes for layouts, dialogs, forms, inputs, notifications, icons, and controls
- Zustand for authentication and notification state
- Axios for API calls outside the FastTrack context
- SCSS/CSS plus the local `pdp-design-system` package
- `react-force-graph-2d` for relationship graph rendering

## Getting Started

Install the UI dependencies from this directory:

```bash
npm install
```

Create `.env` from `.env_SAMPLE` and adjust the values for the environment where the API is available. Start the development server:

```bash
npm run dev
```

Open the URL printed by Vite. The application starts at `/signin`; authenticated views are available at `/app/search` and `/app/alerts`.

## Environment Variables

The sample environment file contains the supported UI settings. Vite exposes only variables beginning with `VITE_` to the application.

| Variable | Purpose | Sample value |
| --- | --- | --- |
| `VITE_APP_APP_NAME` | Application name | `Email Search` |
| `VITE_APP_PROXY_HOST` | API/proxy hostname | `localhost` |
| `VITE_APP_PROXY_PORT` | API/proxy port | `8091` |
| `VITE_APP_AUTH_WITH_TARGET_ON_AUTH` | Whether authentication checks the target service | `true` |
| `VITE_APP_SEARCH_DEFAULT_OPTIONS_STR` | Initial search scope | `all` |
| `VITE_APP_NOTIFICATION_TIMEOUT_SHORT` | Short notification timeout in milliseconds | `3000` |
| `VITE_APP_NOTIFICATION_TIMEOUT_LONG` | Long notification timeout in milliseconds | `7000` |
| `VITE_APP_PAGELENGTH_VALUES` | Available result page sizes | `[10, 25, 50, 100]` |
| `VITE_APP_DEFAULT_PAGELENGTH` | Initial result page size | `10` |

Do not commit `.env` files containing credentials or environment-specific secrets.

## Application Areas

### Routes and pages

- `src/pages/SignIn.tsx`: sign-in screen
- `src/pages/SearchPage.tsx`: search, facets, result list, document preview, and graph view
- `src/pages/AlertsPage.tsx`: alert list and alert details
- `src/pages/Layout.tsx`: shared application layout and navigation
- `src/pages/AuthenticatedPages.tsx`: protects authenticated routes and redirects to sign-in
- `src/pages/ErrorPage.tsx`: route error fallback

Routes are assembled in `src/routes.tsx`:

- `/signin`
- `/app/search`
- `/app/alerts`

### Reusable components

- `src/components/NavigationDrawer.tsx`: application navigation
- `src/components/NetworkGraphSPARQL.tsx`: relationship graph visualization
- `src/components/AlertGraphTimeline.tsx`: alert timeline chart
- `src/components/TimelineEmailSearch.tsx`: timeline view for search results
- `src/components/Notifications.tsx`: notification badge and list

### Supporting code

- `src/store/`: Zustand stores for authentication and notifications
- `src/hooks/`: reusable hooks such as `useAuth`
- `src/services/`: API client and service integrations
- `src/entities/`: shared TypeScript interfaces
- `src/config/`: search-box and collection configuration
- `src/configuration/`: application configuration constants
- `src/utils/`: data transformation and document rendering helpers
- `src/local.ts`: local application configuration
- `public/`: static assets

## Data and Search Concepts

The search UI is configured for these collections:

- `/type/emails`
- `/type/transcripts`
- `/type/trades`

Search filters include Broker, keyword, email sender, email recipient, sender and recipient first names, transcript speaker, and date range. `Broker` values are sourced from trade documents at `trade.Broker`; the corresponding MarkLogic search constraint and string path-range index are maintained in the `datahub/` project. The alerts view uses alert documents and can display related trade, email, and transcript information.

## FastTrack Integration

The main MarkLogic interaction is provided by `MarkLogicContext` from `ml-fasttrack`. Pages access it with `useContext(MarkLogicContext)` and use the context as the shared source of search and selected-document state.

Important context methods and values include:

- `setQtext(query)`: update the current search text.
- `setCollections(collections)`: update the selected collection scope.
- `setPageStart(page)` and `postSearch(qtext, page)`: start or refresh a search.
- `addStringFacetConstraint(selection)`: apply a string facet.
- `addRangeFacetConstraint(constraint)` and `removeRangeFacetConstraint(constraint)`: apply or clear the date range.
- `searchResponse`: current facets and result records.
- `getDocument(uri)`: load one document into `documentResponse`.
- `setDocumentResponse(null)`: close or clear the selected document.
- `request({ url, method, ... })`: make specialized requests, such as alert evaluation.
- `postSparql(query, bindings)`: retrieve relationship graph data.

The primary FastTrack components are `SearchBox`, `StringFacet`, `DateRangeFacet`, `ResultsCustom`, `WindowCard`, `DataGrid`, and `NetworkGraph`. `DataGrid` and `NetworkGraph` are imported from `ml-fasttrack`; do not assume that this project has the separate Kendo Grid or Kendo Charts packages installed.

## Request Boundaries

Use the existing boundary for each operation:

| Operation | UI boundary | Current behavior |
| --- | --- | --- |
| Search and document retrieval | `MarkLogicContext` | FastTrack context methods and components |
| Alert lookup | `context.request()` | `POST /v1/eval` with a JavaScript `cts.search(cts.collectionQuery("alerts"))` expression |
| Relationship graph | `context.postSparql()` | SPARQL query with a bound selected-document URI |
| Authentication | `src/services/api-client.ts` | Axios calls to `/auth/in`, `/auth/out`, and `/v1/search` |

`api-client.ts` builds its base URL from `APP_CONFIG.APP_PROXY_HOST` and `APP_CONFIG.APP_PROXY_PORT`. Keep search requests in FastTrack and use `APIClient` only for the existing non-FastTrack boundary unless the design changes.

The alert evaluation response is multipart text using the `BOUNDARY` marker. `AlertsPage.tsx` extracts the URI and JSON payload before resolving the source trade with `context.getDocument()`. Preserve the response headers, boundary, and parsing contract when changing alert loading.

## UI Data Lifecycles

### Search

1. `SearchBox` sends query text and collection selection to `handleSearch`.
2. `handleSearch` calls `setQtext()` and `setCollections()`.
3. On an empty initial response, `SearchPage.tsx` sets page `1` and calls `postSearch()`.
4. Facets update context constraints; the date facet also keeps its selected range in local state.
5. `ResultsCustom` consumes `searchResponse.results` and uses `customResultRender` for each result.

### Document inspection

Selecting a result calls `getDocument(uri)` and resets the selected tab to `Document`. The selected document is rendered through `WindowCard`. The `Graph` tab is available only for transcript documents because `NetworkGraphSPARQL.tsx` uses transcript-specific predicates and bindings. Closing the view calls `setDocumentResponse(null)`. Preserve this shared state flow when adding document actions.

### Relationship graphs

`NetworkGraphSPARQL.tsx` calls `postSparql()` only when a selected document URI exists. It binds `transcriptURI` using the current MarkLogic URI convention and maps `response.results.bindings` into `NetworkGraph` data. Keep empty responses from reaching graph rendering and preserve the binding name expected by the query.

### Alerts

`AlertsPage.tsx` loads alerts from the `alerts` collection, builds a Security Count from related email and transcript references, and opens `AlertGraphTimeline` for a selected alert. Expanding a subject lists the source trade URI plus every related URI, with duplicates removed. Alert fields currently include `triggerWords`, `URI`, and `referringDocs`; treat these fields and related documents as potentially absent at the response boundary.

## Configuration Caveats

- `.env_SAMPLE` documents the UI variables, while `src/configuration/index.ts` reads additional optional values such as `VITE_APP_SEARCH_DEFAULT_PAGE_LENGTH`, `VITE_APP_SEARCH_MAX_ENUMERATED_PAGES`, and `VITE_APP_SEARCH_FACET_VIEWER_LESSER_AMOUNT_TO_DISPLAY`.
- `VITE_APP_PAGELENGTH_VALUES` is represented as a string in Vite environment variables and must remain compatible with the pagination configuration.
- `SearchBox.config.js` is intentionally JavaScript and currently uses array-valued collection entries. Preserve the `label` and `value` shape when editing the search menu.
- `src/App.scss` imports the Kendo default theme from `@progress/kendo-theme-default/dist/all.scss`.
- `@progress/kendo-licensing` and `telerik-license.txt` are local project assets. Do not print license contents or bypass licensing warnings in application code.

## Safe Change Workflow

1. Find the owning page, component, service, store, or configuration file.
2. Trace the existing request and state flow before changing the API shape.
3. Reuse `MarkLogicContext`, FastTrack components, Zustand stores, and the existing Axios client boundaries.
4. Update shared response types under `src/entities/` when a response shape changes.
5. Handle loading, empty, unauthorized, malformed, and request-error states.
6. Check both authenticated and unauthenticated routes when authentication or document access is involved.
7. Keep query values bound or escaped; do not interpolate untrusted input into `cts` or SPARQL text.
8. Run lint and build, then manually exercise the affected search, document, graph, or alert flow.

## Guidance for Coding Agents

- Use `MarkLogicContext` and existing FastTrack components for search and document retrieval.
- Use the existing Zustand stores and `useAuth()` hook. Preserve the `AuthenticatedPages` route guard.
- Put reusable components in `src/components/` and route-level views in `src/pages/`.
- Define shared interfaces in `src/entities/` and use TypeScript for new code.
- Keep API, `cts`, and SPARQL logic in services or utilities rather than embedding it in components.
- Follow the existing KendoReact and SCSS/CSS patterns; prefer stylesheet classes for new styles while preserving existing inline layout values unless a deliberate refactor is requested.
- Check `package.json` before importing a UI package. The current project does not include `@progress/kendo-react-grid` or a KendoReact chart package.
- Keep changes focused and avoid modifying the local `ml-fasttrack-1.1.0-ea.tgz` or `pdp-design-system` packages unless the task requires it.

## Commands

Run these commands from `ui/`:

```bash
npm run dev      # Start the Vite development server
npm run build    # Type-check and build the production bundle
npm run lint     # Run ESLint with zero warnings allowed
npm run preview  # Preview the production build locally
```

There is currently no test script or test framework configured in `package.json`. For UI changes, run `npm run lint` and `npm run build`, then manually verify the affected route and its authenticated behavior.
