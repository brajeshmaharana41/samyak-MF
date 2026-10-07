import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '@samyak/shared-services';
import { PageHeaderComponent, StatusBadgeComponent } from '@samyak/shared-ui';
import { MODULE_INFO } from '../../data/records';
import { RecordsStore } from '../../data/records.store';

/** Module dashboard: a few stat cards counted from this module's data. */
@Component({
  selector: 'csd-dashboard-page',
  imports: [RouterLink, ButtonModule, PageHeaderComponent, StatusBadgeComponent],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
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
