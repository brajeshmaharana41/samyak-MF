/**
 * Native Federation config for the REMOTE "risk-based-premium" (key "rbp", port 4206).
 *
 * A remote is built and deployed on its own (`ng build risk-based-premium`).
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
  name: 'risk-based-premium',

  // What this remote offers to the shell. The shell calls
  //   loadRemoteModule('rbp', './routes')
  // and mounts these routes under /rbp.
  exposes: {
    './routes': './projects/risk-based-premium/src/app/app.routes.ts',
  },

  // Shared at runtime as ONE copy (singleton) across the shell and all remotes:
  // @angular/*, rxjs, primeng... Versions come from the root package.json.
  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },

  // Our local libs (tsconfig.json "paths"), shared the same way: the shell's
  // copy is reused, so AuthService here is the SAME instance the shell logged in with.
  sharedMappings: ['@samyak/shared-ui', '@samyak/shared-services'],

  skip: ['rxjs/ajax', 'rxjs/fetch', 'rxjs/testing', 'rxjs/webSocket'],

  features: {
    // Only share what is actually imported.
    ignoreUnusedDeps: true,
  },
});
