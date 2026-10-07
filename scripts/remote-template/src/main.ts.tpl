/**
 * Entry point used ONLY when this remote is opened directly (http://localhost:__PORT__).
 *
 * Inside the shell this file is never executed: the shell loads the exposed
 * './routes' (see federation.config.js) and mounts them in its own router.
 *
 * initFederation() with no manifest = "I'm a remote, I don't load other remotes".
 */
import { initFederation } from '@angular-architects/native-federation';

initFederation()
  .catch((err) => console.error(err))
  .then((_) => import('./bootstrap'))
  .catch((err) => console.error(err));
