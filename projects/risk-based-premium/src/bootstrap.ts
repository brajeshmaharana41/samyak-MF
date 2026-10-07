import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

/*
 * IMPORTANT for Native Federation's `ignoreUnusedDeps` feature:
 * it decides which packages to share by following imports starting at main.ts.
 * The exposed routes (what the shell actually loads) are not otherwise reachable
 * from here, so we reference them explicitly. Without this line, primeng,
 * @angular/router, @samyak/shared-ui and @samyak/shared-services would NOT be
 * shared, and this remote would get its own second copy of AuthService.
 */
import { routes as exposedRoutes } from './app/app.routes';
void exposedRoutes;

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
