import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Observable, map } from 'rxjs';

/** What the caller passes to the confirm dialog. */
export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** true = red confirm button (for destructive actions such as Disable). */
  danger?: boolean;
}

/**
 * Generic yes/no dialog. This is the ONLY dialog in the shared library;
 * dialogs that belong to one module (edit forms etc.) live in that module.
 *
 * Open it with the helper below; it closes with `true` (confirmed) or `false`.
 */
@Component({
  selector: 'samyak-confirm-dialog',
  imports: [ButtonModule],
  template: `
    <p class="message">{{ data.message }}</p>
    <div class="buttons">
      <p-button [label]="data.cancelLabel ?? 'Cancel'" severity="secondary" [text]="true" (onClick)="close(false)" />
      <p-button
        [label]="data.confirmLabel ?? 'Confirm'"
        [severity]="data.danger ? 'danger' : 'primary'"
        (onClick)="close(true)"
      />
    </div>
  `,
  styles: `
    .message { margin: 0 0 1.5rem; line-height: 1.5; }
    .buttons { display: flex; justify-content: flex-end; gap: 0.5rem; }
  `,
})
export class ConfirmDialogComponent {
  private readonly ref = inject(DynamicDialogRef);
  protected readonly data = inject(DynamicDialogConfig<ConfirmDialogData>).data as ConfirmDialogData;

  protected close(confirmed: boolean): void {
    this.ref.close(confirmed);
  }
}

/**
 * Opens the shared confirm dialog and emits true/false once.
 *
 *   openConfirmDialog(this.dialogService, { title: 'Approve?', message: '...' })
 *     .subscribe(ok => { if (ok) { ... } });
 */
export function openConfirmDialog(dialogs: DialogService, data: ConfirmDialogData): Observable<boolean> {
  const ref = dialogs.open(ConfirmDialogComponent, {
    header: data.title,
    data,
    modal: true,
    closable: true,
    width: '28rem',
    breakpoints: { '640px': '92vw' },
  });
  if (!ref) {
    throw new Error('Could not open confirm dialog');
  }
  return ref.onClose.pipe(map((result) => result === true));
}
