import { Component, computed, input } from '@angular/core';
import { PageHeaderComponent, StatusBadgeComponent } from '@samyak/shared-ui';
import { USERS } from './user.model';

/** /users/:id — reached from the "View" action. Reads the id from the route. */
@Component({
  selector: 'app-user-detail-page',
  imports: [PageHeaderComponent, StatusBadgeComponent],
  template: `
    <div class="page">
      <samyak-page-header [title]="user()?.name ?? 'User not found'" subtitle="User details" backLink="/users" />
      @if (user(); as u) {
        <dl class="card">
          <dt>ID</dt><dd>{{ u.id }}</dd>
          <dt>Role</dt><dd>{{ u.role }}</dd>
          <dt>Department</dt><dd>{{ u.department }}</dd>
          <dt>Status</dt><dd><samyak-status-badge [status]="u.status" /></dd>
        </dl>
      } @else {
        <p>No user with id "{{ id() }}".</p>
      }
    </div>
  `,
  styles: `
    .page { max-width: 800px; margin: 0 auto; padding: 1.5rem 1rem; }
    .card { display: grid; grid-template-columns: 10rem 1fr; gap: 0.75rem 1rem; background: #fff; padding: 1.5rem; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,.08); margin: 0; }
    dt { color: #6b7280; }
    dd { margin: 0; font-weight: 500; }
  `,
})
export class UserDetailPage {
  /** Bound from the :id route param (withComponentInputBinding in app.config.ts). */
  readonly id = input.required<string>();
  protected readonly user = computed(() => USERS.find((u) => u.id === this.id()));
}
