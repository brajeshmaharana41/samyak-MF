import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

/**
 * Thin wrapper around PrimeNG's MessageService so pages don't depend on PrimeNG details.
 * The shell provides MessageService once and renders one <p-toast>; remotes just call
 * toaster.success(...) and the message appears in the shell's toast.
 */
@Injectable({ providedIn: 'root' })
export class ToasterService {
  private readonly messages = inject(MessageService);

  success(detail: string, summary = 'Success'): void {
    this.messages.add({ severity: 'success', summary, detail, life: 3000 });
  }

  info(detail: string, summary = 'Info'): void {
    this.messages.add({ severity: 'info', summary, detail, life: 3000 });
  }

  warn(detail: string, summary = 'Warning'): void {
    this.messages.add({ severity: 'warn', summary, detail, life: 4000 });
  }

  error(detail: string, summary = 'Error'): void {
    this.messages.add({ severity: 'error', summary, detail, life: 5000 });
  }
}
