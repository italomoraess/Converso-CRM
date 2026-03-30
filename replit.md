# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── converso/           # Converso CRM — React Native (Expo) mobile app
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## Converso CRM (Mobile App)

Located at `artifacts/converso/`. Full-featured CRM for Brazilian small businesses and freelancers.

### Features
- **Leads**: Register and manage leads with WhatsApp integration, search, filtering
- **Funil (Kanban)**: Visual sales funnel with 6 stages: Novo Lead → Em Contato → Proposta Enviada → Em Negociação → Fechado → Perdido
- **Agenda**: Task management grouped by Today/Upcoming/Completed with lead linking
- **Catálogo**: Product/service catalog with categories, pricing, and duration tracking
- **Relatórios**: Dashboard with lead conversion stats, bar chart by week, pie chart by origin

### Key Files
- `app/_layout.tsx` — Root layout with AppProvider, fonts, navigation
- `app/(tabs)/` — All 5 tab screens (leads, kanban, agenda, catalogo, relatorios)
- `app/lead/new.tsx` — Lead registration form
- `app/lead/[id].tsx` — Lead detail with WhatsApp/Call/Task actions
- `app/task/new.tsx` — Task creation with lead search
- `app/perdidos.tsx` — Lost leads with reasons
- `contexts/AppContext.tsx` — Global state with AsyncStorage persistence
- `types/index.ts` — TypeScript interfaces for Lead, Task, CatalogProduct, etc.
- `utils/index.ts` — Phone formatting, currency, WhatsApp URL, badge styles
- `constants/colors.ts` — Brand colors (deep blue #1a56db palette)

### Tech Stack (Mobile)
- Expo Router (file-based navigation)
- React Native with TypeScript
- AsyncStorage for local persistence (no backend required)
- @expo/vector-icons (Feather)
- expo-haptics for tactile feedback
- react-native-keyboard-controller for form handling
- Inter font family

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec.

### `scripts` (`@workspace/scripts`)

Utility scripts package.
