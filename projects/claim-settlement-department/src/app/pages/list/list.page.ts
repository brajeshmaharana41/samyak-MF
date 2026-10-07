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
import { COLUMNS, DepositorClaim, MODULE_INFO } from '../../data/records';
import { RecordsStore } from '../../data/records.store';
import { RequestDocumentsDialogComponent } from '../../dialogs/request-documents-dialog/request-documents-dialog.component';

/**
 * CSD list page: the SHARED table with CSD's own columns, data and actions.
 *   open     -> navigates to the claim detail page
 *   docs     -> opens a CSD-owned dialog
 *   approve  -> shared ConfirmDialog, then marks the claim as Paid
 */
@Component({
  selector: 'csd-list-page',
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

  protected readonly actions: TableAction[] = [
    { key: 'open', label: 'Open claim', icon: 'pi pi-folder-open' },
    { key: 'requestDocs', label: 'Request documents', icon: 'pi pi-file', visible: (c: DepositorClaim) => c.stage !== 'Paid' },
    {
      key: 'approvePayout',
      label: 'Approve payout',
      icon: 'pi pi-indian-rupee',
      // Only approved claims can be paid out.
      visible: (c: DepositorClaim) => c.stage === 'Approved',
    },
  ];

  protected onAction({ action, row }: TableActionEvent<DepositorClaim>): void {
    switch (action) {
      case 'open':
        this.router.navigate([row.id], { relativeTo: this.route });
        return;
      case 'requestDocs':
        return this.requestDocuments(row);
      case 'approvePayout':
        return this.approvePayout(row);
    }
  }

  private requestDocuments(row: DepositorClaim): void {
    this.dialogs
      .open(RequestDocumentsDialogComponent, { header: 'Request documents', data: row, modal: true, width: '32rem' })
      ?.onClose.subscribe((documents?: string[]) => {
        if (documents?.length) {
          this.toaster.info(`Requested ${documents.length} document(s) from ${row.depositor}.`);
        }
      });
  }

  private approvePayout(row: DepositorClaim): void {
    openConfirmDialog(this.dialogs, {
      title: 'Approve payout',
      message: `Release ${this.inr.transform(row.amount)} to ${row.depositor} for claim ${row.claimId}?`,
      confirmLabel: 'Approve payout',
    }).subscribe((ok) => {
      if (ok) {
        this.store.update({ ...row, stage: 'Paid' });
        this.toaster.success(`Payout for ${row.claimId} approved.`);
      }
    });
  }
}
