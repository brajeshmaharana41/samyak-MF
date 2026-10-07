import { Injectable, computed, signal } from '@angular/core';

/**
 * Global loading indicator state. Any page (shell or remote) calls show()/hide();
 * the single <samyak-loader> in the shell renders the overlay.
 * A counter is used so overlapping calls don't hide the loader too early.
 */
@Injectable({ providedIn: 'root' })
export class LoaderService {
  private readonly pending = signal(0);
  readonly isLoading = computed(() => this.pending() > 0);

  show(): void {
    this.pending.update((n) => n + 1);
  }

  hide(): void {
    this.pending.update((n) => Math.max(0, n - 1));
  }

  /** Shows the loader for a short time. Handy for mock "saving..." feedback. */
  flash(ms = 600): Promise<void> {
    this.show();
    return new Promise((resolve) =>
      setTimeout(() => {
        this.hide();
        resolve();
      }, ms),
    );
  }
}
