import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { ToasterService } from '@samyak/shared-services';
import {
  CurrencyInrPipe,
  DataTableComponent,
  PageHeaderComponent,
  TableAction,
  TableActionEvent,
  openConfirmDialog,
} from '@samyak/shared-ui';
import { COLUMNS, MODULE_INFO, RecoveryCase } from '../../data/records';
import { RecordsStore } from '../../data/records.store';
import { RecordPaymentDialogComponent } from '../../dialogs/record-payment-dialog/record-payment-dialog.component';

/**
 * RMC list page: the SHARED table with RMC's own columns, data and actions.
 *   recordPayment -> opens an RMC-owned dialog
 *   view          -> navigates to the case detail page
 *   writeOff      -> shared ConfirmDialog, then a toast
 */
@Component({
  selector: 'rmc-list-page',
  imports: [PageHeaderComponent, DataTableComponent],
  // Provide DialogService here so dialogs opened from this remote page work.
  providers: [DialogService],
  templateUrl: './list.page.html',
  styleUrl: './list.page.scss',
})
export class ListPage {
  private readonly dialogs = inject(DialogService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toaster = inject(ToasterService);
  protected readonly store = inject(RecordsStore);

  protected readonly info = MODULE_INFO;
  protected readonly columns = COLUMNS;
  private readonly inr = new CurrencyInrPipe();

  /** Payments and write-offs only make sense while money is still outstanding. */
  private readonly isActive = (c: RecoveryCase) => c.outstanding > 0 && c.status !== 'Written Off';

  protected readonly actions: TableAction[] = [
    { key: 'recordPayment', label: 'Record payment', icon: 'pi pi-indian-rupee', visible: this.isActive },
    { key: 'view', label: 'View case', icon: 'pi pi-eye' },
    { key: 'writeOff', label: 'Write off', icon: 'pi pi-ban', visible: this.isActive },
  ];

  protected onAction({ action, row }: TableActionEvent<RecoveryCase>): void {
    switch (action) {
      case 'recordPayment':
        return this.recordPayment(row);
      case 'view':
        this.router.navigate([row.id], { relativeTo: this.route });
        return;
      case 'writeOff':
        return this.writeOff(row);
    }
  }

  private recordPayment(row: RecoveryCase): void {
    this.dialogs
      .open(RecordPaymentDialogComponent, { header: 'Record payment', data: row, modal: true, width: '30rem' })
      ?.onClose.subscribe((updated?: RecoveryCase) => {
        if (updated) {
          this.store.update(updated);
          this.toaster.success(`Recorded ${this.inr.transform(updated.recovered - row.recovered)} for ${row.caseId}.`);
        }
      });
  }

  private writeOff(row: RecoveryCase): void {
    openConfirmDialog(this.dialogs, {
      title: 'Write off balance',
      message: `Write off the outstanding ${this.inr.transform(row.outstanding)} for ${row.caseId} (${row.bankName})?`,
      confirmLabel: 'Write off',
      danger: true,
    }).subscribe((ok) => {
      if (ok) {
        this.store.update({ ...row, status: 'Written Off' });
        this.toaster.warn(`${row.caseId} written off.`);
      }
    });
  }
}
