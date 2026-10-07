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
  template: `
    <header class="page-header">
      <div class="left">
        @if (backLink()) {
          <p-button
            icon="pi pi-arrow-left"
            [rounded]="true"
            [text]="true"
            severity="secondary"
            [routerLink]="backLink()"
            [ariaLabel]="backLabel()"
          />
        }
        <div>
          <h1>{{ title() }}</h1>
          @if (subtitle()) {
            <p>{{ subtitle() }}</p>
          }
        </div>
      </div>
      <div class="right"><ng-content /></div>
    </header>
  `,
  styles: `
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 1.25rem;
    }
    .left { display: flex; align-items: center; gap: 0.5rem; }
    .right { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
    h1 { margin: 0; font-size: 1.5rem; font-weight: 600; }
    p { margin: 0.25rem 0 0; color: #6b7280; }
  `,
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  /** If set, shows a back arrow linking to this route (string or array). */
  readonly backLink = input<string | any[]>();
  readonly backLabel = input('Back');
}
