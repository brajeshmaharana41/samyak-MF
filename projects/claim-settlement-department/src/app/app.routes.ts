import { Routes } from '@angular/router';
import { ModuleLayoutComponent } from './layout/module-layout.component';

/**
 * EXPOSED to the shell as './routes' (see federation.config.js).
 *
 * The shell mounts these under /csd, so:
 *   /csd                  -> dashboard
 *   /csd/records          -> list page (shared table)
 *   /csd/records/:id      -> detail page
 *
 * The shell's authGuard already protects /csd, so no guard is needed here.
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
