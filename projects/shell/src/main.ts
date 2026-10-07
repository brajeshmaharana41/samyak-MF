/**
 * Shell entry point.
 *
 * Step 1: initFederation() downloads federation.manifest.json (served from the
 *         shell's /public folder). The manifest maps a short key ("brc", "iod"...)
 *         to the URL of that remote's remoteEntry.json.
 *         It also registers the SHARED packages (Angular, RxJS, PrimeNG and our
 *         @samyak/* libs) so every remote reuses the shell's single copy.
 * Step 2: only after that do we import ./bootstrap, which starts Angular.
 *
 * Remotes are NOT downloaded here. Each one is fetched later, the first time
 * the user clicks its tile (see loadRemoteModule in app.routes.ts).
 *
 * To point at different servers (local / uat / prod), deploy a different
 * federation.manifest.json. No rebuild needed.
 */
import { initFederation } from '@angular-architects/native-federation';

initFederation('federation.manifest.json')
  .catch((err) => console.error(err))
  .then((_) => import('./bootstrap'))
  .catch((err) => console.error(err));
