# CLAUDE.md — Samyak micro-frontend workspace

Rules for anyone (human or AI) changing this repo. Read before editing.

## Stack
- Angular 21 (standalone components only, no NgModules), TypeScript strict, SCSS, SSR off.
  (Angular 22 needs Node >= 22.22.3; this machine has Node 22.14, so we are on 21.)
- Native Federation 21 (`@angular-architects/native-federation`). **Never** webpack Module Federation.
- PrimeNG 21 in styled mode with the Aura preset from `@primeuix/themes`, configured once in the shell's `app.config.ts`.
- Federation config file is `projects/<app>/federation.config.js` (CommonJS). The builder looks for that exact name.

## Hard constraints
1. No Nexus, no npm publishing. Shared code = local libs in this repo only.
2. One workspace, one `angular.json` (shell, every remote, the shared libs).
3. Each remote builds alone: `ng build <remote>`. The shell never imports remote source; it only knows remote URLs from `projects/shell/public/federation.manifest.json` (runtime).
4. Remotes never import from other remotes, and never from the shell. Only from `@samyak/shared-ui` and `@samyak/shared-services`.
5. Authentication lives only in the shell and `@samyak/shared-services`. Remotes never implement login.
6. Shared singletons: `@angular/*`, `rxjs`, `primeng`, `@samyak/shared-ui`, `@samyak/shared-services`.
   Every `federation.config.js` uses `shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' })`
   and `sharedMappings: ['@samyak/shared-ui', '@samyak/shared-services']`.
7. Libs are **source only**: tsconfig `paths` point at `projects/<lib>/src/public-api.ts`. There is no lib build target.
   Lib `package.json` lists Angular/rxjs/primeng as `peerDependencies`. Export everything via `public-api.ts`.
8. Services in shared-services are `providedIn: 'root'` (one instance across shell + remotes).

## Native Federation gotchas (learned the hard way)
- `features.ignoreUnusedDeps` finds packages to share by walking imports from `main.ts`. A remote's exposed
  `app.routes.ts` is not reachable from there, so every remote's `src/bootstrap.ts` imports `./app/app.routes`
  explicitly. Removing it silently stops sharing PrimeNG and the `@samyak/*` libs (you'd get a 2nd AuthService).
  Check with: `node -e "console.log(require('./dist/<app>/browser/remoteEntry.json').shared.map(s=>s.packageName))"`.
- `@primeuix/themes` is in the shell's `skip` list: only the shell uses it, and sharing it would drop the `/aura` sub-path.
- After changing a federation config or what gets imported, restart `ng serve` for that app.
- Remotes have `buildNotifications.enable: false` in angular.json. With all remotes proxied through one origin, their
  never-ending SSE live-reload streams would use up the browser's 6-connections-per-origin limit and freeze the page.

## Table and actions pattern
- Every list page uses `DataTableComponent` (`<samyak-data-table>`) from `@samyak/shared-ui`.
- Inputs: `columns: TableColumn[]`, `data: any[]`, `actions: TableAction[]`, `pageSize`. Output: `actionClick` `{ action, row }`.
- The table has **no business logic**. It only reports the click; the parent page decides (open dialog / navigate / confirm).
- Module-specific dialogs live inside that module. Only the generic `ConfirmDialogComponent` is shared.
- Page components that open dialogs provide `DialogService` in their own `providers`.
- Module data is a JSON file inside the module's source (`src/app/data/*.json`), imported in TS. Never fetch `/assets/...` from a remote (it would resolve against the shell's origin).
- Each module: at least one dialog action and one navigate action. Navigate with `router.navigate([row.id], { relativeTo: route })` to a detail page that reads `:id`.

## Remotes
| folder | key | port |
|---|---|---|
| bank-registration-cell | brc | 4201 |
| insurance-operation-department | iod | 4202 |
| claim-settlement-department | csd | 4203 |
| complaint-redressal-cell | crc | 4204 |
| recovery-management-cell | rmc | 4205 |
| risk-based-premium | rbp | 4206 |

Shell: 4200. Each remote exposes `./routes` (its `app.routes.ts`). The shell mounts it at `/<key>` (page URL, e.g. `localhost:4200/brc`).

**Single port:** the browser only talks to 4200. Remote FILES are at `/remotes/<key>/*`, proxied to the remote's own
`ng serve` port by `projects/shell/proxy.conf.json` (dev) and served from `/var/www/samyak/remotes/<key>/` by nginx (prod).
Manifests point at `.../remotes/<key>/remoteEntry.json`. Keep page URLs (`/<key>`) and file URLs (`/remotes/<key>`) separate.

Add a new module: `node scripts/add-remote.mjs <folder-name> <key> <port> "<Tile title>"`, (it also adds the proxy entry and `dev:<key>`), then review the generated tile entry in
`projects/shell/src/app/modules.config.ts`.

## Commands
- `npm run dev:<key>` (shell + one module, open localhost:4200/<key>) / `npm run start:all` / `npm run start:<key>`
- `npm run build:all` / `npm run build:shell` / `npm run build:<key>`
- `npx ng test shared-services`
