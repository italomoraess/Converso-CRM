# Converso CRM (Expo)

## Estrutura (padrão Expo / React Native)

```text
app/           # Expo Router (telas)
components/    # Componentes reutilizáveis
constants/     # Tema, cores
contexts/      # Estado global (React)
services/      # API (fetch)
types/         # Tipos TypeScript
utils/         # Helpers
server/        # Servidor estático pós-build (Replit/produção)
scripts/       # build.js (bundle estático), post-merge.sh
app.json       # Config Expo
```

Monorepo interno do pnpm: só o pacote na raiz (`pnpm-workspace.yaml` com `packages: ['.']`), para manter overrides e `minimumReleaseAge` usados no Replit.

## API

Defina `EXPO_PUBLIC_API_URL` para a sua API externa. Sem isso, o app usa `http://localhost:3000` por padrão.

## Scripts

- `pnpm run dev` — desenvolvimento no Replit (variáveis `REPLIT_*` / `PORT`)
- `pnpm run start` — Expo local (`expo start`)
- `pnpm run typecheck` — TypeScript
- `pnpm run build` — typecheck + bundle estático (`scripts/build.js`)
- `pnpm run serve` — serve `static-build/` após o build

## Replit

O arquivo `.replit-artifact/artifact.toml` aponta para `pnpm run dev`, `pnpm run build` e `pnpm run serve`. A estrutura plana é compatível com o fluxo mobile do Replit; não é necessário pasta `artifacts/`.
