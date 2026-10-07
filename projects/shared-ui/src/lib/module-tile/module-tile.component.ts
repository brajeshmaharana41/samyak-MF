import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';
import { ModuleTile } from '@samyak/shared-services';

/** One card on the landing page. Clicking it opens the module (a remote) inside the shell. */
@Component({
  selector: 'samyak-module-tile',
  imports: [RouterLink, NgTemplateOutlet],
  template: `
    @if (tile().enabled) {
      <a class="tile" [routerLink]="tile().route">
        <ng-container *ngTemplateOutlet="content" />
        <span class="cta">Open module <i class="pi pi-arrow-right"></i></span>
      </a>
    } @else {
      <div class="tile disabled" aria-disabled="true">
        <span class="soon">Coming soon</span>
        <i [class]="tile().icon + ' icon'"></i>
        <h3>{{ tile().title }}</h3>
        <p>{{ tile().description }}</p>
      </div>
    }

    <ng-template #content>
      <i [class]="tile().icon + ' icon'"></i>
      <h3>{{ tile().title }}</h3>
      <p>{{ tile().description }}</p>
    </ng-template>
  `,
  styles: `
    :host { display: block; }
    .tile {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      height: 100%;
      padding: 1.5rem;
      border-radius: 12px;
      background: #fff;
      color: inherit;
      text-decoration: none;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      border: 1px solid transparent;
      transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
    }
    a.tile:hover, a.tile:focus-visible {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(30, 58, 138, 0.15);
      border-color: #c7d2fe;
      outline: none;
    }
    .icon { font-size: 2rem; color: #1e3a8a; }
    h3 { margin: 0.5rem 0 0; font-size: 1.1rem; }
    p { margin: 0; color: #6b7280; font-size: 0.9rem; line-height: 1.4; flex: 1; }
    .cta { color: #1e3a8a; font-weight: 600; font-size: 0.9rem; }
    .disabled { opacity: 0.55; cursor: not-allowed; }
    .soon {
      position: absolute;
      top: 1rem;
      right: 1rem;
      font-size: 0.75rem;
      padding: 0.15rem 0.5rem;
      border-radius: 999px;
      background: #e5e7eb;
      color: #374151;
    }
  `,
})
export class ModuleTileComponent {
  readonly tile = input.required<ModuleTile>();
}
