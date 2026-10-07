import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { authGuard, guestGuard, otpGuard } from '@samyak/shared-services';
import { MODULES } from './modules.config';

/**
 * One lazy route per business module, generated from modules.config.ts.
 *
 *   http://localhost:4200/brc  ->  loadRemoteModule('brc', './routes')
 *
 * loadRemoteModule looks up "brc" in federation.manifest.json, downloads that
 * remote's remoteEntry.json and then its exposed './routes' file. This happens
 * ONLY when the user first navigates here (clicks the tile), so the browser
 * never downloads modules the user does not open.
 *
 * Page URLs (/brc, /iod...) and remote FILE URLs (/remotes/brc/...) are kept
 * apart on purpose: /remotes/* is proxied to the remote's server (proxy.conf.json
 * in dev, nginx in prod); everything else is the shell's Angular router.
 *
 * The shell has no import of any remote's source code: just a key and a URL.
 */
const moduleRoutes: Routes = MODULES.filter((m) => m.enabled).map((m) => ({
  path: m.key,
  canActivate: [authGuard],
  loadChildren: () => loadRemoteModule(m.key, './routes').then((r) => r.routes),
}));

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },

  // ---- Public: the two login steps ----
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'otp',
    canActivate: [otpGuard],
    loadComponent: () => import('./pages/otp/otp.page').then((m) => m.OtpPage),
  },

  // ---- Protected shell pages (login + OTP required) ----
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'users',
    canActivate: [authGuard],
    children: [
      { path: '', loadComponent: () => import('./pages/users/users.page').then((m) => m.UsersPage) },
      { path: ':id', loadComponent: () => import('./pages/users/user-detail.page').then((m) => m.UserDetailPage) },
    ],
  },

  // ---- Business modules = remotes loaded at runtime ----
  ...moduleRoutes,

  { path: '**', redirectTo: 'home' },
];
