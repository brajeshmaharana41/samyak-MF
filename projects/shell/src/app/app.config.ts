import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';
import { MessageService } from 'primeng/api';
import { authInterceptor } from '@samyak/shared-services';

import { routes } from './app.routes';

/** Aura theme with a banking blue as the primary colour (applies to the shell AND every remote). */
const SamyakTheme = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{blue.50}', 100: '{blue.100}', 200: '{blue.200}', 300: '{blue.300}', 400: '{blue.400}',
      500: '{blue.500}', 600: '{blue.600}', 700: '{blue.700}', 800: '{blue.800}', 900: '{blue.900}', 950: '{blue.950}',
    },
  },
});

/**
 * Root providers of the WHOLE application.
 *
 * Remote routes are loaded into the shell's router, so remote pages run inside
 * this same injector tree: they get the shell's router, HttpClient and the
 * PrimeNG theme configured here. Remotes don't repeat this setup.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor])),
    // One MessageService for the whole app -> used by ToasterService (shell + remotes).
    MessageService,
    // PrimeNG v21 "styled mode": the Aura preset injects its CSS variables at runtime.
    providePrimeNG({ theme: { preset: SamyakTheme, options: { darkModeSelector: '.app-dark' } } }),
  ],
};
