import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

/**
 * Title bar at the top of every page.
 * Put extra buttons/info on the right using content projection:
 *   <samyak-page-header title="Users" backLink="/home"> <button>..</button> </samyak-page-header>
 */
@Component({
  selector: 'samyak-page-header',
  imports: [RouterLink, ButtonModule],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss',
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  /** If set, shows a back arrow linking to this route (string or array). */
  readonly backLink = input<string | any[]>();
  readonly backLabel = input('Back');
}
