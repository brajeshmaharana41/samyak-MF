import { Component, inject } from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LoaderService } from '@samyak/shared-services';

/**
 * Full-screen loading overlay. Placed ONCE in the shell's root template.
 * Any page in the shell or in a remote calls LoaderService.show()/hide() to drive it.
 */
@Component({
  selector: 'samyak-loader',
  imports: [ProgressSpinnerModule],
  template: `
    @if (loader.isLoading()) {
      <div class="overlay" role="status" aria-label="Loading">
        <p-progress-spinner strokeWidth="4" ariaLabel="Loading" />
      </div>
    }
  `,
  styles: `
    .overlay {
      position: fixed;
      inset: 0;
      z-index: 5000;
      display: grid;
      place-items: center;
      background: rgba(255, 255, 255, 0.6);
    }
  `,
})
export class LoaderComponent {
  protected readonly loader = inject(LoaderService);
}
