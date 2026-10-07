# Samyak — micro-frontend prototype (Angular + Native Federation)

A working prototype that splits the `banking-registration-cell-frontend` monolith into a **shell**
and **six independently built business modules (remotes)**, using
[Native Federation](https://www.npmjs.com/package/@angular-architects/native-federation).
Shared code lives in **two local libraries in this repo**. No Nexus, nothing published.

| | |
|---|---|
| Angular | 21.2 (standalone components, strict TS, SCSS, no SSR) |
| Native Federation | `@angular-architects/native-federation` 21.2 |
| UI | PrimeNG 21 (styled mode, Aura preset from `@primeuix/themes`, blue primary) |
| Node | 22.14 works. Angular 22 would need Node ≥ 22.22.3 |

Demo login: **admin / admin**, OTP **111111**.

---

## Architecture

```
              Browser — talks ONLY to http://localhost:4200
 ┌──────────────────────────────────────────────────────────────────────┐
 │ SHELL  (localhost:4200)                                              │
 │  login · OTP · landing tiles · users page · router · <p-toast> · loader│
 │                                                                      │
 │  main.ts ── initFederation('federation.manifest.json')               │
 │                 │   { "brc": ".../remotes/brc/remoteEntry.json",       │
 │                 │     "iod": ".../remotes/iod/remoteEntry.json",       │
 │                 │     ... }                                          │
 │                                                                      │
 │  page /brc ── loadRemoteModule('brc', './routes')  ← only on click   │
 │  page /iod ── loadRemoteModule('iod', './routes')                    │
 │   ...                                                                │
 │                                                                      │
 │  Shared ONCE (singletons) for shell + all remotes:                   │
 │   @angular/*  rxjs  primeng  @samyak/shared-ui  @samyak/shared-services│
 └───────────────┬──────────────┬──────────────┬────────────────────────┘
                 │              │              │   /remotes/<key>/* is proxied to the module
                 │              │              │   (dev: proxy.conf.json · prod: nginx)
     ┌───────────▼───┐  ┌───────▼───────┐  ┌───▼───────────┐
     │ brc  :4201    │  │ iod  :4202    │  │ ... rbp :4206 │   each: own build,
     │ exposes       │  │ exposes       │  │ exposes       │   own dist folder,
     │ './routes'    │  │ './routes'    │  │ './routes'    │   own deploy
     └───────────────┘  └───────────────┘  └───────────────┘

 Source (one workspace, one angular.json):
   projects/shell                         host
   projects/<six remotes>                 remotes (import only @samyak/* libs)
   projects/shared-ui                     table, confirm dialog, header, badge, loader, tile, pipes
   projects/shared-services               auth, guards, interceptor, loader, toaster, ModuleTile
```

| Remote folder | Key | Page URL | Dev server (behind the proxy) | Tile |
|---|---|---|---|---|
| `bank-registration-cell` | `brc` | `localhost:4200/brc` | 4201 | Bank Registration Cell |
| `insurance-operation-department` | `iod` | `localhost:4200/iod` | 4202 | Insurance Operation Department |
| `claim-settlement-department` | `csd` | `localhost:4200/csd` | 4203 | Claim Settlement Department |
| `complaint-redressal-cell` | `crc` | `localhost:4200/crc` | 4204 | Complaint Redressal Cell |
| `recovery-management-cell` | `rmc` | `localhost:4200/rmc` | 4205 | Recovery Management Cell |
| `risk-based-premium` | `rbp` | `localhost:4200/rbp` | 4206 | Risk Based Premium |

---

## Run locally

You only ever open **http://localhost:4200**. Each module appears at its own path:
`localhost:4200/brc`, `localhost:4200/iod`, and so on.

**Shell + one module** (the normal way to work on a module):

```bash
npm install
npm run dev:brc          # shell + Bank Registration Cell  ->  http://localhost:4200/brc
npm run dev:rmc          # shell + Recovery Management Cell ->  http://localhost:4200/rmc
```

**Everything** (e.g. for a demo):

```bash
npm start                # = npm run start:all: shell + all six modules
```

**Plain `ng serve`?** It serves one project, and the name is required in this multi-project workspace:
`ng serve shell -o` (shell only; module tiles then stay on the home page) or `ng serve bank-registration-cell`.
A bare `ng s -o` fails with "Cannot determine project". Use the npm scripts above to start the shell
together with a module.

After you change a **module's** code, press F5 in the browser. The module rebuilds automatically,
but live-reload notifications for modules are switched off (`buildNotifications.enable: false`), because six
never-ending notification streams through one origin would use up the browser's 6-connections
limit and freeze the page. Changes to the shell still reload automatically.

How the single port works: every module is still its own app with its own `ng serve`
(BRC listens on 4201 in the background, and so on). The shell's dev server **proxies**
`localhost:4200/remotes/brc/*` to it (`projects/shell/proxy.conf.json`). The browser never sees
the other ports, and production uses the same `/remotes/<key>/` paths through nginx.

The **first** start takes a few minutes because Native Federation prepares the shared packages for
each app. After that they are cached, and restarts are quick.

Tiles of modules that are not running don't open (you stay on the home page). The rest of the
shell keeps working.

## Build one module / build everything

```bash
npm run build:brc        # = ng build bank-registration-cell -> dist/bank-registration-cell only
npm run build:shell      # = ng build shell                  -> dist/shell only
npm run build:all        # shell + all six remotes, one after another
```

Building a remote never touches the shell, and the shell never needs a remote's source.

## Add a new module

```bash
node scripts/add-remote.mjs treasury-cell trc 4207 "Treasury Cell" --icon "pi pi-money-bill" --description "Investments and liquidity."
```

The script generates the app, makes it a Native Federation remote, copies the template
(dashboard, list with the shared table, detail page, module dialog, sample JSON, layout), enables
CORS on its dev server, adds `trc` to every federation manifest and to the shell's dev proxy,
adds the tile to `projects/shell/src/app/modules.config.ts`, adds `dev:trc` / `start:trc` /
`build:trc` and refreshes `start:all` / `build:all`. Then `npm run dev:trc` opens it at
http://localhost:4200/trc.

Then replace the sample data and actions in `projects/treasury-cell/src/app/data/records.*`
and `pages/list.page.ts`. If the tile entry already exists (e.g. a "Coming soon" tile), the script
just enables it.

## Ground rules

1. **No Nexus, no publishing.** Shared code = the two local libs.
2. **One workspace, one `angular.json`.**
3. **Native Federation only** (no webpack Module Federation).
4. **Each remote builds alone.** The shell only knows remote URLs, from the manifest, at runtime.
5. **Remotes never import other remotes** (or the shell). Only `@samyak/shared-ui` and `@samyak/shared-services`.
6. **Authentication lives only in the shell + `shared-services`.** Remotes read the user from `AuthService`.
7. **The shared table has no business logic.** It emits `actionClick`; the page decides
   (dialog / navigate / confirm). Module dialogs live in the module; only `ConfirmDialogComponent` is shared.
8. **Module data is imported from JSON in the remote's own source**, never fetched from `/assets`
   (that URL would resolve against the shell's origin).

See `CLAUDE.md` for the full list.

## How shared code works (without Nexus)

1. **tsconfig paths → source.** `tsconfig.json` maps
   `@samyak/shared-ui` → `projects/shared-ui/src/public-api.ts` and
   `@samyak/shared-services` → `projects/shared-services/src/public-api.ts`.
   The libs are never built or packaged. Each app compiles the shared source it imports.

2. **`sharedMappings`.** Every `federation.config.js` lists both libs under `sharedMappings`.
   Native Federation bundles each mapped lib as a separate shared file and records it in the
   app's `remoteEntry.json`. At runtime the **shell's copy is used** and the remotes reuse it.

3. **Singletons.** `shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' })`
   does the same for `@angular/*`, `rxjs` and `primeng`. One Angular, one router, one PrimeNG.
   And since `AuthService` is `providedIn: 'root'` in a singleton lib, **every remote gets the
   same `AuthService` instance** the shell logged in with.

4. **`peerDependencies`.** Each lib's `package.json` declares Angular, RxJS and PrimeNG as
   peerDependencies, documenting that the lib never brings its own copy.

5. **`ignoreUnusedDeps`.** Only packages that are actually imported are shared, which keeps builds fast.
   This feature finds imports by walking from `main.ts`. A remote's exposed routes aren't
   reachable from its `main.ts`, so each remote's `src/bootstrap.ts` references
   `./app/app.routes` explicitly. **Don't remove that line**, or PrimeNG and the `@samyak` libs
   stop being shared by that remote.

6. **Why does every `dist/<remote>` also contain Angular and PrimeNG files?** They are
   *fallbacks*. At runtime the browser uses the shell's copy (same version, singleton), and the
   remote's copies are never downloaded. You can check this in the Network tab (see DEMO-GUIDE §3).

**What happens when a shared lib changes?** Its source changes in this repo, so rebuild and
redeploy the shell **and** every remote that uses the changed part (`npm run build:all` is
the simple, safe option). Because everything is in one repo with one `package.json`, versions
can't drift apart.

## Environments and deployment

The shell reads `federation.manifest.json` **at runtime**. One manifest per environment lives in
`projects/shell/federation-manifests/`:

```
federation.manifest.local.json   http://localhost:4200/remotes/brc/remoteEntry.json ...
federation.manifest.uat.json     https://samyak-uat.example.in/remotes/brc/remoteEntry.json ...
federation.manifest.prod.json    https://samyak.example.in/remotes/brc/remoteEntry.json ...
```

Build once, then choose the environment by copying a manifest into the built shell:

```bash
npm run build:all
node scripts/use-manifest.mjs prod      # writes dist/shell/browser/federation.manifest.json
```

There are no per-environment builds of the remotes. `deploy/nginx.conf` is a sample that serves the shell at `/` (with SPA
fallback, so page URLs like `/brc/records/BRC-001` work) and each remote's files under
`/remotes/<key>/`, with `remoteEntry.json` and the manifest marked
`no-cache` and CORS headers for cross-origin setups.

## Project map

```
projects/
  shell/
    federation.config.js           host config (no exposes)
    public/federation.manifest.json         manifest used by ng serve
    proxy.conf.json                dev proxy: /remotes/<key> -> that module's ng serve
    federation-manifests/*.json             local / uat / prod manifests
    src/main.ts                    initFederation(manifest) → bootstrap
    src/app/app.routes.ts          login/otp/home/users + one loadRemoteModule route per tile
    src/app/modules.config.ts      the tile list (single source of truth)
    src/app/pages/                 login, otp, home, users (+ shell-owned dialog, detail)
  <remote>/
    federation.config.js           exposes './routes'
    src/bootstrap.ts               standalone fallback + the ignoreUnusedDeps reference
    src/app/app.routes.ts          EXPOSED routes: '' dashboard, records, records/:id
    src/app/data/records.json      module data
    src/app/data/records.ts        interface, table columns, module info
    src/app/pages/list.page.ts     shared table + all action handling
    src/app/dialogs/               module-owned dialogs
  shared-ui/src/lib/               data-table, confirm-dialog, page-header, status-badge, loader, module-tile, pipes
  shared-services/src/lib/         auth (service, guards, interceptor), loader, toaster, modules.model
scripts/
  add-remote.mjs                   generator for new modules
  remote-template/                 files the generator copies
  use-manifest.mjs                 pick the environment manifest after a build
deploy/nginx.conf                  sample production web server config
```

Tests: `npm test` runs the `AuthService` and `authGuard` unit tests (Vitest).
