# Demo guide — Samyak micro-frontends

A click-by-click script for presenting the prototype to the team (about 20–25 minutes).

**Credentials:** `admin` / `admin`, OTP `111111` (also shown on the screens).

---

## 0. Before the meeting (10 minutes earlier)

```bash
cd samyak-workspace
npm run start:all
```

Wait until all seven apps print `Local: http://localhost:42xx/`. The very first start is slow
(each app prepares its shared packages once), so start early. Later starts are fast.

You only ever open **http://localhost:4200**. Modules appear at `localhost:4200/brc`, `/iod` and so on.
The module dev servers run in the background; the shell's dev server proxies `/remotes/<key>/*` to them.
(To work on just one module, `npm run dev:brc` starts the shell + BRC only.)

Open **Chrome or Edge** at http://localhost:4200, and open DevTools (F12) on the **Network** tab.
Tick **Disable cache**.

Have VS Code open on the repo for the code parts.

---

## 1. The big picture (2 min, slide or README diagram)

- One Angular workspace: a **shell** plus **six remotes**, each built and deployed on its own.
- The shell knows remotes only by **URL** (`federation.manifest.json`), loaded at runtime.
- Shared code = two **local** libraries, `@samyak/shared-ui` and `@samyak/shared-services`.
  No Nexus, nothing published.

---

## 2. Login and OTP (2 min)

1. Go to http://localhost:4200/home and show you are redirected to **/login** (guard).
2. Type `admin` / `wrong` → **"Invalid user ID or password"**.
3. Type `admin` / `admin` → OTP page.
4. Type `123456` → **"Incorrect OTP"**.
5. Type `111111` → landing page with **six tiles** and a "Welcome, Admin User" toast.

> Say: "Login, OTP, the guard and the session all live in the shell and the shared-services lib.
> No module implements login."

---

## 3. Only the clicked module is downloaded (4 min) ★ key moment

1. In the Network tab, **clear** the log. Set the filter to `/remotes/`.
   Every module file lives under `localhost:4200/remotes/<key>/`, so the path shows which module it belongs to.
2. Reload the landing page. Show that the only module requests are the small
   **`remoteEntry.json`** files (a few KB each: the "table of contents" of each module).
   No JavaScript from any module yet.
3. Clear the log, then click **Bank Registration Cell**.
4. The address bar now shows **`localhost:4200/brc`**. Show the new requests: **only `/remotes/brc/...`**:
   `routes.js`, `dashboard.page-*.js`, a few chunks.
5. Point out what is **not** there: no `@angular/core`, `primeng`, `shared-ui` or `shared-services`
   under `/remotes/brc/`. Those come from the shell and are **reused** (singletons).
6. Click **Back to home**, clear the log, click **Risk Based Premium** → only `/remotes/rbp/...`.

> Say: "Each tile is a separate application. The browser only downloads a module when the
> user opens it, and Angular/PrimeNG are downloaded once for the whole app."

Optional: run `npm run dev:brc` instead of `start:all`. Only BRC opens; the other tiles stay on the
home page, and the shell keeps working.

---

## 4. Same shared table, different data and actions (5 min)

**a) Shell → Users** (link in the top bar)

- Columns: ID, Name, Role, Department, Status.
- Row menu (⋮) → **Edit** → *shell-owned* dialog → change the name → Save → toast, row updated.
- ⋮ → **View** → navigates to `/users/U002` detail page.
- ⋮ → **Disable** → the *shared* confirm dialog → Disable → status turns red.

**b) Bank Registration Cell** (`localhost:4200/brc`) → **Registrations** tab

- Different columns: Bank, Registration No., State, Status, Submitted On.
- ⋮ → **Edit** → *BRC-owned* dialog (bank name, reg. no., state).
- ⋮ → **Approve** (only on Pending / Under Review rows) → shared confirm → toast.
- ⋮ → **View** → `localhost:4200/brc/records/BRC-002` detail page → back arrow.

**c) Recovery Management Cell** (`localhost:4200/rmc`) → **Recovery Cases**

- Different columns again: Case ID, Outstanding (₹), Recovered (₹), Status.
- ⋮ → **Record payment** → RMC dialog with an INR amount → Outstanding/Recovered update.
- ⋮ → **Write off** → shared confirm (red). ⋮ → **View case** → detail page.

Now show the code side by side:

- `projects/shared-ui/src/lib/data-table/data-table.component.ts`: read the comment box at the top.
  The table only does `actionClick.emit({ action, row })`.
- `projects/bank-registration-cell/src/app/pages/list.page.ts`: `onAction()` with a `switch`.
  **The page** decides: dialog, navigate or confirm.
- `projects/recovery-management-cell/src/app/pages/list.page.ts`: same table, different switch.

> Say: "One table component, zero business logic in it. Every module brings its own columns,
> data (a JSON file in the module) and actions."

Every module has all three kinds of action:

| Module | Dialog | Navigate | Shared confirm |
|---|---|---|---|
| Users (shell) | Edit | View | Disable |
| BRC | Edit | View | Approve |
| IOD | Update status | View details | Mark lapsed (on "Renewal Due") |
| CSD | Request documents | Open claim | Approve payout (on "Approved") |
| CRC | Assign | View thread | Close ticket |
| RMC | Record payment | View case | Write off |
| RBP | Override grade | View breakdown | Recalculate |

---

## 5. One shared AuthService (2 min)

1. Inside any module, point at the top-right: **"Admin User"**, and the dashboard says
   "Welcome, Admin User".
2. Open `projects/bank-registration-cell/src/app/layout/module-layout.component.ts`:
   `inject(AuthService)` from `@samyak/shared-services`, and the remote never logs in.
3. Open `projects/bank-registration-cell/federation.config.js`: `sharedMappings` lists both libs.

> Say: "Because the lib is shared as a singleton, the remote gets the exact same AuthService
> object the shell logged in with."

4. Back on the landing page click **Logout**, then type http://localhost:4200/brc in the
   address bar → redirected to **/login**.

---

## 6. Build one module vs. build all (3 min)

In a second terminal:

```bash
npm run build:brc
```

- Only `dist/bank-registration-cell/` is (re)written. Show `dist/shell` timestamps are unchanged.
- Open `dist/bank-registration-cell/browser/remoteEntry.json`:
  - `exposes`: `./routes`
  - `shared`: `@angular/core`, `@angular/router`, `primeng/table`, ..., `@samyak/shared-ui`,
    `@samyak/shared-services`, all with `"singleton": true`.

```bash
npm run build:all
```

- Builds the shell and all six remotes one after another; show the seven folders in `dist/`.

---

## 7. Add a new module in one command (3 min)

```bash
node scripts/add-remote.mjs treasury-cell trc 4207 "Treasury Cell" --icon "pi pi-money-bill"
```

Show what changed (`git status`):

- `projects/treasury-cell/`: a full remote from the template.
- `projects/shell/public/federation.manifest.json` and the env manifests: `"trc": ...`.
- `projects/shell/src/app/modules.config.ts`: one new tile entry.
- `projects/shell/proxy.conf.json`: `/remotes/trc` → port 4207.
- `package.json`: `dev:trc`, `start:trc`, `build:trc`, and `start:all` / `build:all` now include it.

Run `npm run dev:trc` → open http://localhost:4200/trc.

Clean up afterwards with `git checkout . && git clean -fd projects/treasury-cell`.

---

## 8. Questions the team will ask

**Why Native Federation and not webpack Module Federation?**
Angular's CLI now builds with esbuild/Vite. Module Federation needs webpack, so we'd have to
keep the old, slower builder. Native Federation works with the esbuild application builder and
uses browser standards (ES modules and import maps). It's maintained by the same author as the
Angular Module Federation plugin, and has the same mental model (host, remotes, exposes, shared).

**How does shared code work without Nexus?**
The libraries are folders in this repo. `tsconfig.json` paths point every app at their source,
so each app compiles them. Native Federation (`sharedMappings`) then bundles each lib as one
shared file, and at runtime all apps use the shell's single copy. Nothing is published.

**What happens when a shared lib changes?**
Change it in the repo and rebuild the apps that use it (simplest: `npm run build:all`), then
deploy. Because there is one repo and one `package.json`, every app always builds against
the same version, so there's no "which lib version is module X on?" problem. If one remote is deployed with
an older lib build, the shell's copy is still used at runtime, so keep lib changes backwards-compatible
or deploy all apps together for breaking changes.

**How does deployment work?**
`npm run build:all` (or `build:<key>` for one module). Each app's `dist/<app>/browser` folder is
copied to its own location (see `deploy/nginx.conf`: shell at `/`, module files at `/remotes/brc/`, `/remotes/iod/`, ...).
The shell picks environment URLs from `federation.manifest.json` at runtime:
`node scripts/use-manifest.mjs uat|prod`. Same artefacts for every environment, and one remote
can be redeployed alone without touching the shell.

**Can a module team work and release independently?**
Yes for code inside their remote: they build and deploy only their folder. Shared libs and
shared package upgrades (Angular, PrimeNG) are coordinated changes across all apps.

**What if a remote server is down?**
The shell starts anyway, and only that tile fails to open. The rest of the application works.

**Why is the data a JSON import and not `/assets/data.json`?**
Inside the shell, `/assets/...` resolves to the **shell's** server, not the remote's. Importing
the JSON bundles it into the remote's own JavaScript, so it works wherever the remote is hosted.
Later, real APIs replace `RecordsStore` in each module.

**Isn't one repo a monolith again?**
The *source* is in one repo for easy sharing, but the *runtime and deployment* are split:
seven separate builds, seven separate deploys, and lazy loading per module.
