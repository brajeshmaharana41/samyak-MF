import { Routes } from '@angular/router';
import { ModuleLayoutComponent } from './layout/module-layout/module-layout.component';

/**
 * EXPOSED to the shell as './routes' (see federation.config.js).
 *
 * The shell mounts these under /crc, so:
 *   /crc                  -> dashboard
 *   /crc/records          -> list page (shared table)
 *   /crc/records/:id      -> detail page
 *
 * The shell's authGuard already protects /crc, so no guard is needed here.
 */
export const routes: Routes = [
  {
    path: '',
    component: ModuleLayoutComponent,
    children: [
      { path: '', loadComponent: () => import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage) },
      {
        path: 'records',
        children: [
          { path: '', loadComponent: () => import('./pages/list/list.page').then((m) => m.ListPage) },
          { path: ':id', loadComponent: () => import('./pages/detail/detail.page').then((m) => m.DetailPage) },
        ],
      },
    ],
  },
];
