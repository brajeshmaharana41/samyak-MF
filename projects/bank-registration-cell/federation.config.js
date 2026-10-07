/**
 * Native Federation config for the REMOTE "bank-registration-cell" (key "brc", port 4201).
 *
 * A remote is built and deployed on its own (`ng build bank-registration-cell`).
 * The build produces remoteEntry.json: a small file listing what this remote
 * exposes and which shared packages it expects. The shell downloads it at
 * runtime using the URL from its federation.manifest.json.
 *
 * Note: the builder looks for a file named exactly `federation.config.js`, and
 * this workspace is CommonJS, so we use require().
 */
const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  // Unique name of this remote.
  name: 'bank-registration-cell',

  // What this remote offers to the shell. The shell calls
  //   loadRemoteModule('brc', './routes')
  // and mounts these routes under /brc.
  exposes: {
    './routes': './projects/bank-registration-cell/src/app/app.routes.ts',
  },

  // Shared at runtime as ONE copy (singleton) across the shell and all remotes:
  // @angular/*, rxjs, primeng... Versions come from the root package.json.
  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },

  // Our local libs (tsconfig.json "paths"), shared the same way: the shell's
  // copy is reused, so AuthService here is the SAME instance the shell logged in with.
  sharedMappings: ['@samyak/shared-ui', '@samyak/shared-services'],

  // Packages that are NOT shared:
  //  - rxjs extras we never use in the browser
  //  - pdfjs-dist: a BRC-ONLY library (certificate preview). Skipping it means it is
  //    bundled into BRC's own lazy chunks instead of being registered as a shared
  //    singleton. The shell and the other modules never see or download it.
  //  - @napi-rs/canvas*: optional Node-only dependency of pdfjs-dist (server-side rendering),
  //    never used in the browser
  skip: ['rxjs/ajax', 'rxjs/fetch', 'rxjs/testing', 'rxjs/webSocket', 'pdfjs-dist', /^@napi-rs\/canvas/],

  features: {
    // Only share what is actually imported.
    ignoreUnusedDeps: true,
  },
});
