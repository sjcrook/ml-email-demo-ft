# User Interface - MarkLogic Email Intelligence

## Project Overview

This is a **Vite + React + TypeScript** application built on **MarkLogic FastTrack** (`ml-fasttrack` npm package). It provides a frontend for analysts to search trade-related email and transcript data stored in MarkLogic, visualize entity relationships via SPARQL-powered network graphs, and monitor alerts triggered by suspicious link/keyword detection.

## Tech Stack & Frameworks

| Layer               | Technology                                                                                                                               |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework**       | React 18+ (Functional Components & Hooks)                                                                                                |
| **MarkLogic SDK**   | `ml-fasttrack` — provides `MarkLogicContext`, `SearchBox`, `DataGrid`, and other React components that abstract MarkLogic REST API calls |
| **Build Tool**      | Vite (`vite.config.ts`)                                                                                                                  |
| **Language**        | TypeScript (strict mode via `tsconfig.json`)                                                                                             |
| **UI Components**   | KendoReact (`@progress/kendo-react-*`) — Grid, Layout, Dialog, TabStrip, Charts                                                          |
| **Graph Rendering** | `react-force-graph-2d` — used in `NetworkGraphSPARQL.tsx`                                                                                |
| **Styling**         | SCSS (`App.scss`), CSS (`App.css`), and a local `pdp-design-system/` package                                                             |
| **State Mgmt**      | Zustand (`src/store/`)                                                                                                                   |
| **Routing**         | React Router v6 (`createBrowserRouter` in `src/routes.tsx`)                                                                              |
| **HTTP Client**     | Axios (wrapped in `src/services/api-client.ts`)                                                                                          |
| **Licensing**       | Telerik/KendoReact license (`telerik-license.txt`)                                                                                       |

## Architecture & FastTrack Integration

### MarkLogicContext (Core Pattern)

The entire app is wrapped in a `MarkLogicContext` provider (from `ml-fasttrack`). All pages access MarkLogic through this context:

```
MarkLogicContext provides:
├── context.setQtext(query)           → Set search query text
├── context.setCollections(cols)      → Filter by MarkLogic collections
├── context.addStringFacetConstraint() → Add facet filters
├── context.addRangeFacetConstraint()  → Add date/range filters
├── context.removeRangeFacetConstraint()
├── context.searchResponse            → Current search results
├── context.getDocument(uri)          → Fetch a single document by URI
├── context.documentResponse          → Current loaded document
└── context.request({url, method...}) → Raw HTTP proxy to MarkLogic REST API
```

### Data Flow

```
User Action → FastTrack Component (SearchBox/DataGrid)
            → MarkLogicContext
            → Vite Proxy (vite.config.ts)
            → MarkLogic REST API (/v1/search, /v1/eval, /v1/graphs/sparql)
            → Response flows back through context → Re-renders UI
```

## File Structure & Responsibilities

### `/src/pages/` — Route-level views

| File                     | Route       | Purpose                                                                     |
| ------------------------ | ----------- | --------------------------------------------------------------------------- |
| `SearchPage.tsx`         | `/search`   | Main search interface with facets, results, document preview, and graph tab |
| `AlertsPage.tsx`         | `/alerts`   | Displays alerts triggered by keyword/link detection in trade documents      |
| `SignIn.tsx`             | `/signin`   | Login form; authenticates against MarkLogic via `useAuth` hook              |
| `Layout.tsx`             | (wrapper)   | Shared layout with `NavigationDrawer` sidebar                               |
| `AuthenticatedPages.tsx` | (guard)     | Route guard; redirects unauthenticated users to `/signin`                   |
| `ErrorPage.tsx`          | (fallback)  | Displayed on routing errors                                                 |
| `customResultRender.tsx` | (component) | **Note**: This is a render helper, not a page. Should be in `/components/`  |

### `/src/components/` — Reusable UI components

| File                      | Purpose                                                                                                                                  |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `NetworkGraphSPARQL.tsx`  | Force-directed graph powered by SPARQL queries against MarkLogic triples. Visualizes relationships between emails, senders, and entities |
| `AlertGraphTimeline.tsx`  | KendoReact Chart showing alert events plotted on a timeline                                                                              |
| `TimelineEmailSearch.tsx` | Temporal visualization of email search results                                                                                           |
| `NavigationDrawer.tsx`    | KendoReact Drawer sidebar for app navigation between Search and Alerts                                                                   |
| `Notifications.tsx`       | Notification badge/dropdown; reads from `useNotificationStore`                                                                           |

### `/src/store/` — Zustand state stores

| File                      | State Managed                                |
| ------------------------- | -------------------------------------------- |
| `useAuthStore.ts`         | User authentication status, tokens, session  |
| `useNotificationStore.ts` | Alert notifications count, read/unread state |
| `index.ts`                | Store exports                                |

### `/src/services/`

| File            | Purpose                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------- |
| `api-client.ts` | Axios instance configured with base URL from `.env`. Used for any calls outside FastTrack context |

### `/src/config/`

| File                  | Purpose                                                                                                                                               |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SearchBox.config.js` | Declares search box menu items, collections, and placeholder text for the FastTrack `<SearchBox>` component. **⚠️ Should be converted to TypeScript** |

### `/src/configuration/`

| File       | Purpose                                                                  |
| ---------- | ------------------------------------------------------------------------ |
| `index.ts` | App-level configuration constants (likely MarkLogic connection settings) |

### `/src/entities/` — TypeScript interfaces

| File               | Defines                                        |
| ------------------ | ---------------------------------------------- |
| `AuthStatus.ts`    | Shape of auth state (authenticated, user info) |
| `Notification.ts`  | Alert/notification data model                  |
| `SearchResults.ts` | Typed search response from MarkLogic           |

### `/src/hooks/`

| File         | Purpose                                                                                |
| ------------ | -------------------------------------------------------------------------------------- |
| `useAuth.ts` | Custom hook wrapping `useAuthStore`; provides `login()`, `logout()`, `isAuthenticated` |

### `/src/utils/`

| File                  | Purpose                                                                |
| --------------------- | ---------------------------------------------------------------------- |
| `dataTransform.ts`    | Transforms raw MarkLogic response data into UI-friendly structures     |
| `renderUtilities.tsx` | Shared render helpers (e.g., document rendering, snippet highlighting) |

### `/src/local.ts`

App configuration constants (e.g., `APP_CONFIG`). Environment-specific overrides.

## Domain Context

### Data Model

The MarkLogic database stores:

- **Trade documents** (`/trades/*.json`) — contain Broker, Security (Symbol), TradeDateTime
- **Email documents** (`/emails/*.json`) — email threads with sender, recipient, body, links
- **Transcript documents** (`/transcripts/*.json`) — communication transcripts
- **Alert documents** (collection: `"alerts"`) — generated when trigger words or suspicious links are detected; contain `triggerWords`, `URI` (reference to source trade), and `referringDocs` (array of related email/transcript URIs)

### Search Facets (SearchPage)

The following facets are configured:

- `Keyword` — Full-text keyword
- `EmailFrom` / `EmailTo` — Sender/recipient email addresses
- `FirstnameFrom` / `FirstNameTo` — Sender/recipient first names
- `Speaker` — Speaker in transcripts
- `Date` — Date range filter (default: 1980–2030)

### Alert Flow (AlertsPage)

1. Backend: MarkLogic alerting triggers on document ingestion when `triggerWords` are found
2. Alerts are stored in the `"alerts"` collection
3. Frontend fetches alerts via `context.request()` calling `/v1/eval` with `cts.search(cts.collectionQuery("alerts"))`
4. Each alert resolves its source trade document via `context.getDocument(uri)`
5. Results displayed in a `DataGrid` with a "View" action that opens a `Dialog` containing `AlertGraphTimeline`

## Environment Configuration

- **`.env`** — Contains `VITE_*` variables for MarkLogic host, port, credentials
- **`.env_SAMPLE`** — Template for new developers
- **`vite.config.ts`** — Configures proxy to forward `/v1/*` requests to the MarkLogic backend

## LLM Developer Guidelines

1. **Search changes**: Modify `src/config/SearchBox.config.js` or FastTrack `MarkLogicContext` methods. Do not create raw `fetch`/`axios` calls for search.
2. **State access**: Use Zustand stores in `src/store/`. Do not introduce Redux or new Context providers.
3. **New components**: Place in `src/components/`. Only full route views go in `src/pages/`.
4. **Styling**: Use CSS classes in `App.css` or `App.scss`. Avoid inline `style={{}}` props.
5. **Types**: All new code must be TypeScript. Define interfaces in `src/entities/`.
6. **MarkLogic queries**: SPARQL and `cts` queries should be extracted to `src/services/` or `src/utils/`, not embedded in components.
7. **Authentication**: Always respect the `AuthenticatedPages` guard. Use `useAuth()` hook for auth state.
