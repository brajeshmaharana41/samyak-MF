/**
 * Native Federation config for the REMOTE "recovery-management-cell" (key "rmc", port 4205).
 *
 * A remote is built and deployed on its own (`ng build recovery-management-cell`).
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
  name: 'recovery-management-cell',

  // What this remote offers to the shell. The shell calls
  //   loadRemoteModule('rmc', './routes')
  // and mounts these routes under /rmc.
  exposes: {
    './routes': './projects/recovery-management-cell/src/app/app.routes.ts',
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
