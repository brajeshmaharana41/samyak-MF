/**
 * Native Federation config for the SHELL (the host application).
 *
 * The shell is a "dynamic host": it does NOT know its remotes at build time.
 * It reads their URLs at runtime from public/federation.manifest.json
 * (see src/main.ts). That is why the shell never needs a remote's source code
 * to build — it only needs a URL.
 *
 * Note: the Native Federation builder looks for a file named exactly
 * `federation.config.js`, and this workspace is CommonJS, so we use require().
 */
const { withNativeFederation, shareAll } = require('@angular-architects/native-federation/config');

module.exports = withNativeFederation({
  name: 'shell',

  // A host exposes nothing. (Remotes have an `exposes` block here.)

  // Every npm package in package.json "dependencies" is shared as ONE copy
  // (singleton) across the shell and all remotes: @angular/*, rxjs, primeng...
  // strictVersion + requiredVersion 'auto' = versions come from package.json,
  // and a mismatch is reported instead of silently loading two copies.
  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },

  // Our LOCAL libraries (tsconfig.json "paths"). They are compiled from source
  // and shared at runtime exactly like an npm package: one copy, so there is one
  // AuthService instance and one DataTableComponent for the whole application.
  sharedMappings: ['@samyak/shared-ui', '@samyak/shared-services'],

  // Packages that are NOT shared:
  //  - rxjs extras we never use in the browser
  //  - @primeuix/themes: only the shell configures the theme (app.config.ts), so it
  //    is simply bundled into the shell. (Sharing it would also need its '/aura'
  //    sub-path mapped, which ignoreUnusedDeps doesn't detect.)
  skip: ['rxjs/ajax', 'rxjs/fetch', 'rxjs/testing', 'rxjs/webSocket', '@primeuix/themes'],

  features: {
    // Only share the packages (and secondary entry points such as
    // primeng/table) that are actually imported. Much faster builds.
    ignoreUnusedDeps: true,
  },
});
