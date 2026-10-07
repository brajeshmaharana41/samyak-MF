import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@samyak/shared-services';
import { MODULE_INFO } from '../data/records';

/**
 * Frame around every page of this module: title, current user, "Back to home", tabs.
 *
 * The user name comes from the SHARED AuthService. This remote never logs in;
 * it gets the same AuthService instance the shell used, because
 * @samyak/shared-services is shared as a singleton by Native Federation.
 */
@Component({
  selector: 'iod-module-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="module-bar">
      <div class="title">
        <a routerLink="/home" class="back"><i class="pi pi-arrow-left"></i> Back to home</a>
        <span class="divider"></span>
        <i [class]="info.icon"></i>
        <strong>{{ info.title }}</strong>
      </div>
      <div class="user" title="Read from the shared AuthService">
        <i class="pi pi-user"></i> {{ auth.currentUser()?.name ?? 'Unknown user' }}
      </div>
    </header>

    <nav class="tabs">
      <a routerLink="./" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
        <i class="pi pi-th-large"></i> Dashboard
      </a>
      <a routerLink="records" routerLinkActive="active"><i class="pi pi-list"></i> {{ info.listTitle }}</a>
    </nav>

    <main class="module-content">
      <router-outlet />
    </main>
  `,
  styles: `
    .module-bar {
      display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;
      padding: 0.75rem 1.5rem; background: #1e3a8a; color: #fff;
    }
    .title { display: flex; align-items: center; gap: 0.6rem; font-size: 1.05rem; }
    .back { color: #fff; text-decoration: none; font-size: 0.9rem; opacity: 0.9; }
    .back:hover { text-decoration: underline; }
    .divider { width: 1px; height: 1.2rem; background: rgba(255,255,255,.4); }
    .user { opacity: 0.9; }
    .tabs { display: flex; gap: 0.25rem; padding: 0 1.5rem; background: #fff; border-bottom: 1px solid #e5e7eb; overflow-x: auto; }
    .tabs a {
      padding: 0.8rem 1rem; color: #4b5563; text-decoration: none; border-bottom: 3px solid transparent; white-space: nowrap;
    }
    .tabs a.active { color: #1e3a8a; border-bottom-color: #1e3a8a; font-weight: 600; }
    .module-content { max-width: 1200px; margin: 0 auto; padding: 1.5rem 1rem; }
  `,
})
export class ModuleLayoutComponent {
  protected readonly auth = inject(AuthService);
  protected readonly info = MODULE_INFO;
}
