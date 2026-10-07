import { Component, computed, input } from '@angular/core';
import { PageHeaderComponent, StatusBadgeComponent } from '@samyak/shared-ui';
import { USERS } from '../user.model';

/** /users/:id — reached from the "View" action. Reads the id from the route. */
@Component({
  selector: 'app-user-detail-page',
  imports: [PageHeaderComponent, StatusBadgeComponent],
  templateUrl: './user-detail.page.html',
  styleUrl: './user-detail.page.scss',
})
export class UserDetailPage {
  /** Bound from the :id route param (withComponentInputBinding in app.config.ts). */
  readonly id = input.required<string>();
  protected readonly user = computed(() => USERS.find((u) => u.id === this.id()));
}
