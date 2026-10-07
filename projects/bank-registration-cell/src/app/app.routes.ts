import { Routes } from '@angular/router';
import { ModuleLayoutComponent } from './layout/module-layout.component';

/**
 * EXPOSED to the shell as './routes' (see federation.config.js).
 *
 * The shell mounts these under /brc, so:
 *   /brc                  -> dashboard
 *   /brc/records          -> list page (shared table)
 *   /brc/records/:id      -> detail page
 *
 * The shell's authGuard already protects /brc, so no guard is needed here.
 */
export const routes: Routes = [
  {
    path: '',
    component: ModuleLayoutComponent,
    children: [
      { path: '', loadComponent: () => import('./pages/dashboard.page').then((m) => m.DashboardPage) },
      {
        path: 'records',
        children: [
          { path: '', loadComponent: () => import('./pages/list.page').then((m) => m.ListPage) },
          { path: ':id', loadComponent: () => import('./pages/detail.page').then((m) => m.DetailPage) },
        ],
      },
    ],
  },
];
