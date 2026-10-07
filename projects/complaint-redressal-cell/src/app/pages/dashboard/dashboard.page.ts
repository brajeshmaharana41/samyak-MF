import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '@samyak/shared-services';
import { PageHeaderComponent, StatusBadgeComponent } from '@samyak/shared-ui';
import { MODULE_INFO } from '../data/records';
import { RecordsStore } from '../data/records.store';

/** Module dashboard: a few stat cards counted from this module's data. */
@Component({
  selector: 'crc-dashboard-page',
  imports: [RouterLink, ButtonModule, PageHeaderComponent, StatusBadgeComponent],
  template: `
    <samyak-page-header [title]="info.title" [subtitle]="'Welcome, ' + (auth.currentUser()?.name ?? '')">
      <p-button [label]="'Open ' + info.listTitle" icon="pi pi-list" routerLink="records" />
    </samyak-page-header>

    <section class="stats">
      <div class="stat total">
        <span class="label">Total {{ info.listTitle }}</span>
        <span class="value">{{ store.all().length }}</span>
      </div>
      @for (s of stats(); track s.value) {
        <div class="stat">
          <samyak-status-badge [status]="s.value" />
          <span class="value">{{ s.count }}</span>
        </div>
      }
    </section>
  `,
  styles: `
    .stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
    .stat { background: #fff; border-radius: 10px; padding: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,.08); display: flex; flex-direction: column; gap: .75rem; align-items: flex-start; }
    .stat.total { background: #1e3a8a; color: #fff; }
    .label { font-size: .9rem; opacity: .9; }
    .value { font-size: 2rem; font-weight: 700; }
  `,
})
export class DashboardPage {
  protected readonly auth = inject(AuthService);
  protected readonly store = inject(RecordsStore);
  protected readonly info = MODULE_INFO;

  /** e.g. [{ value: 'Approved', count: 3 }, { value: 'Pending', count: 4 }, ...] */
  protected readonly stats = computed(() => {
    const counts = new Map<string, number>();
    for (const row of this.store.all()) {
      const value = String((row as unknown as Record<string, unknown>)[this.info.statusField]);
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    return [...counts].map(([value, count]) => ({ value, count }));
  });
}
