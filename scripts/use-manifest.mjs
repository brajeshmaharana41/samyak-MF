#!/usr/bin/env node
/**
 * use-manifest.mjs — pick the federation manifest for an environment AFTER the build.
 *
 *   node scripts/use-manifest.mjs uat            (writes into dist/shell/browser)
 *   node scripts/use-manifest.mjs prod <folder>  (any folder that contains the built shell)
 *
 * The shell reads federation.manifest.json at runtime (see projects/shell/src/main.ts),
 * so the SAME build artefacts go to local, UAT and prod; only this one JSON file differs.
 * Remotes never need a per-environment build.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [env, target = path.join(root, 'dist', 'shell', 'browser')] = process.argv.slice(2);

const source = path.join(root, 'projects', 'shell', 'federation-manifests', `federation.manifest.${env}.json`);
if (!env || !fs.existsSync(source)) {
  const available = fs
    .readdirSync(path.dirname(source))
    .map((f) => f.match(/^federation\.manifest\.(.+)\.json$/)?.[1])
    .filter(Boolean);
  console.error(`Usage: node scripts/use-manifest.mjs <${available.join('|')}> [shell-output-folder]`);
  process.exit(1);
}
if (!fs.existsSync(target)) {
  console.error(`Folder not found: ${target}. Build the shell first (npm run build:shell).`);
  process.exit(1);
}

fs.copyFileSync(source, path.join(target, 'federation.manifest.json'));
console.log(`federation.manifest.json in ${target} now points at "${env}":`);
console.log(fs.readFileSync(source, 'utf8'));
