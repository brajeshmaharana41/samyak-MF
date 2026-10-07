import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';

/** Providers for standalone mode only (see app.ts). Inside the shell, the shell's providers are used. */
export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners()],
};
