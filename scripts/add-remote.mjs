#!/usr/bin/env node
/**
 * add-remote.mjs — generate a new micro-frontend (remote) and wire it into the shell.
 *
 * Usage:
 *   node scripts/add-remote.mjs <folder-name> <key> <port> ["Tile title"] [--icon "pi pi-box"] [--description "..."]
 *
 * Example:
 *   node scripts/add-remote.mjs treasury-cell trc 4207 "Treasury Cell" --icon "pi pi-money-bill"
 *
 * What it does:
 *   1. ng g application <folder-name>                     (standalone, SCSS, no SSR)
 *   2. ng g @angular-architects/native-federation:init    (as a remote on <port>)
 *   3. Copies scripts/remote-template/** into the new project (dashboard, list, detail,
 *      own dialog, sample JSON data, layout showing the shared AuthService user)
 *   4. angular.json: CORS header on the dev server, live-reload notifications off (see below)
 *   5. Shell: adds "<key>" to every federation manifest, a tile to modules.config.ts, and a
 *      dev proxy entry (/remotes/<key> -> localhost:<port>) to projects/shell/proxy.conf.json
 *   6. package.json: start:<key>, build:<key>, dev:<key> (shell + this module), and refreshes start:all / build:all
 *
 * After running it, replace the sample data/columns/actions in
 * projects/<folder-name>/src/app/data/records.ts, records.json and pages/list.page.ts.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const templateDir = path.join(root, 'scripts', 'remote-template');

/** Base URLs per environment. Remote FILES are served under /remotes/<key>/ (see deploy/nginx.conf). */
const ENVIRONMENTS = {
  uat: 'https://samyak-uat.example.in',
  prod: 'https://samyak.example.in',
};

// ---------- 1. Arguments ----------
const args = process.argv.slice(2);
const option = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const value = args[i + 1];
  args.splice(i, 2);
  return value;
};
const icon = option('icon', 'pi pi-box');
const descriptionArg = option('description', undefined);
const [name, key, portArg, titleArg] = args;

if (!name || !key || !portArg) {
  console.error('Usage: node scripts/add-remote.mjs <folder-name> <key> <port> ["Tile title"] [--icon "pi pi-box"] [--description "..."]');
  process.exit(1);
}
if (!/^[a-z][a-z0-9-]*$/.test(name)) fail(`Folder name "${name}" must be kebab-case.`);
if (!/^[a-z][a-z0-9]*$/.test(key)) fail(`Key "${key}" must be lowercase letters/digits.`);
const port = Number(portArg);
if (!Number.isInteger(port) || port < 1024) fail(`Port "${portArg}" is not valid.`);
if (fs.existsSync(path.join(root, 'projects', name))) fail(`projects/${name} already exists.`);

const title = titleArg ?? name.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
const description = descriptionArg ?? `${title} module.`;
const tokens = {
  __NAME__: name,
  __KEY__: key,
  __KEY_UPPER__: key.toUpperCase(),
  __PORT__: String(port),
  __TITLE__: title,
  __ICON__: icon,
};

function fail(message) {
  console.error('ERROR: ' + message);
  process.exit(1);
}
function run(command) {
  console.log(`\n> ${command}`);
  execSync(command, { cwd: root, stdio: 'inherit', shell: true });
}
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const writeJson = (file, data) => fs.writeFileSync(path.join(root, file), JSON.stringify(data, null, 2) + '\n');

// ---------- 2. Generate the Angular app and make it a Native Federation remote ----------
run(`npx ng g application ${name} --prefix ${key} --style=scss --routing --ssr=false --skip-tests --skip-install`);
run(`npx ng g @angular-architects/native-federation:init --project ${name} --port ${port} --type remote`);

// ---------- 3. Copy the template ----------
const projectDir = path.join(root, 'projects', name);
for (const unused of ['src/app/app.html', 'src/app/app.scss', 'src/app/app.spec.ts']) {
  fs.rmSync(path.join(projectDir, unused), { force: true });
}
function copyTemplate(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const from = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      copyTemplate(from);
      continue;
    }
    const relative = path.relative(templateDir, from).replace(/\.tpl$/, '');
    const to = path.join(projectDir, relative);
    let content = fs.readFileSync(from, 'utf8');
    for (const [token, value] of Object.entries(tokens)) content = content.split(token).join(value);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.writeFileSync(to, content);
    console.log(`  wrote projects/${name}/${relative.replace(/\\/g, '/')}`);
  }
}
copyTemplate(templateDir);

// ---------- 4. angular.json: CORS on the remote's dev server ----------
const angular = readJson('angular.json');
const serveOriginal = angular.projects[name].architect['serve-original'];
serveOriginal.options = { ...serveOriginal.options, port, headers: { 'Access-Control-Allow-Origin': '*' } };
// Turn off NF live-reload notifications for remotes: each one is a never-ending request, and
// because all remotes are proxied through the shell's single origin (localhost:4200), six of them
// would use up the browser's 6-connections-per-origin limit and freeze the page.
angular.projects[name].architect.serve.options = { ...angular.projects[name].architect.serve.options, buildNotifications: { enable: false } };
writeJson('angular.json', angular);

// ---------- 5. Shell wiring: manifests + tile ----------
// Locally the browser only talks to the shell (4200); its dev server proxies /remotes/<key> to the remote.
const localUrl = `http://localhost:4200/remotes/${key}/remoteEntry.json`;
const manifests = { 'projects/shell/public/federation.manifest.json': localUrl };
const envDir = 'projects/shell/federation-manifests';
if (fs.existsSync(path.join(root, envDir))) {
  manifests[`${envDir}/federation.manifest.local.json`] = localUrl;
  for (const [env, base] of Object.entries(ENVIRONMENTS)) {
    manifests[`${envDir}/federation.manifest.${env}.json`] = `${base}/remotes/${key}/remoteEntry.json`;
  }
}
for (const [file, url] of Object.entries(manifests)) {
  const manifest = fs.existsSync(path.join(root, file)) ? readJson(file) : {};
  manifest[key] = url;
  writeJson(file, manifest);
  console.log(`  manifest ${file}: ${key} -> ${url}`);
}

const tilesFile = path.join(root, 'projects/shell/src/app/modules.config.ts');
let tiles = fs.readFileSync(tilesFile, 'utf8');
const existingTile = new RegExp(`(key: '${key}',[\\s\\S]*?enabled: )false`);
if (tiles.includes(`key: '${key}'`)) {
  tiles = tiles.replace(existingTile, '$1true');
  console.log(`  tile "${key}" enabled in modules.config.ts`);
} else {
  const entry = `  {
    key: '${key}',
    title: '${title.replace(/'/g, "\\'")}',
    description: '${description.replace(/'/g, "\\'")}',
    icon: '${icon}',
    route: '/${key}',
    enabled: true,
  },
];`;
  tiles = tiles.replace(/\n\];\s*$/, '\n' + entry + '\n');
  console.log(`  tile "${key}" added to modules.config.ts`);
}
fs.writeFileSync(tilesFile, tiles);

const proxyFile = 'projects/shell/proxy.conf.json';
const proxy = fs.existsSync(path.join(root, proxyFile)) ? readJson(proxyFile) : {};
proxy[`/remotes/${key}`] = { target: `http://localhost:${port}`, pathRewrite: { [`^/remotes/${key}`]: '' }, changeOrigin: true };
writeJson(proxyFile, proxy);
console.log(`  proxy  /remotes/${key} -> http://localhost:${port}`);

// ---------- 6. npm scripts ----------
const pkg = readJson('package.json');
pkg.scripts[`start:${key}`] = `ng serve ${name}`;
pkg.scripts[`build:${key}`] = `ng build ${name}`;
pkg.scripts[`dev:${key}`] = `concurrently -k -n shell,${key} -c auto "npm:start:shell" "npm:start:${key}"`;
const remoteKeys = Object.keys(pkg.scripts)
  .filter((s) => s.startsWith('start:') && !['start:all', 'start:shell'].includes(s))
  .map((s) => s.slice('start:'.length));
const all = ['shell', ...remoteKeys];
pkg.scripts['start:all'] =
  `concurrently -k -n ${all.join(',')} -c auto ` + all.map((k) => `"npm:start:${k}"`).join(' ');
pkg.scripts['build:all'] = all.map((k) => `npm run build:${k}`).join(' && ');
pkg.scripts = sortScripts(pkg.scripts, remoteKeys);
writeJson('package.json', pkg);

/** Keeps package.json readable: dev:<remotes>, start:*, build:*, then the rest. */
function sortScripts(scripts, keys) {
  const order = ['all', 'shell', ...keys];
  const sorted = {};
  for (const prefix of ['dev', 'start', 'build']) {
    for (const k of order) if (scripts[`${prefix}:${k}`]) sorted[`${prefix}:${k}`] = scripts[`${prefix}:${k}`];
  }
  return { ...sorted, ...scripts };
}

console.log(`
Done. "${title}" (${key}) is a new remote on port ${port}.
  Run it:    npm run dev:${key}     (shell + this module)  ->  http://localhost:4200/${key}
  Build it:  npm run build:${key}
  Next:      put your real data/columns/actions in projects/${name}/src/app/data/ and pages/list.page.ts
`);
