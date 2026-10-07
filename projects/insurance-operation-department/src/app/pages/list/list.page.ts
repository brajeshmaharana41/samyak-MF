import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { ToasterService } from '@samyak/shared-services';
import {
  DataTableComponent,
  PageHeaderComponent,
  TableAction,
  TableActionEvent,
  openConfirmDialog,
} from '@samyak/shared-ui';
import { COLUMNS, InsurancePolicy, MODULE_INFO } from '../../data/records';
import { RecordsStore } from '../../data/records.store';
import { UpdateStatusDialogComponent } from '../../dialogs/update-status-dialog/update-status-dialog.component';

/**
 * IOD list page: the SHARED table with IOD's own columns, data and actions.
 *   updateStatus -> opens an IOD-owned dialog
 *   view         -> navigates to the detail page
 *   markLapsed   -> shared ConfirmDialog, then a toast
 */
@Component({
  selector: 'iod-list-page',
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

  protected readonly actions: TableAction[] = [
    { key: 'updateStatus', label: 'Update status', icon: 'pi pi-sync' },
    { key: 'view', label: 'View details', icon: 'pi pi-eye' },
    { key: 'markLapsed', label: 'Mark lapsed', icon: 'pi pi-times-circle', visible: (p: InsurancePolicy) => p.status === 'Renewal Due' },
  ];

  protected onAction({ action, row }: TableActionEvent<InsurancePolicy>): void {
    switch (action) {
      case 'updateStatus':
        return this.updateStatus(row);
      case 'view':
        this.router.navigate([row.id], { relativeTo: this.route });
        return;
      case 'markLapsed':
        return this.markLapsed(row);
    }
  }

  private updateStatus(row: InsurancePolicy): void {
    this.dialogs
      .open(UpdateStatusDialogComponent, { header: 'Update policy status', data: row, modal: true, width: '30rem' })
      ?.onClose.subscribe((updated?: InsurancePolicy) => {
        if (updated) {
          this.store.update(updated);
          this.toaster.success(`${updated.policyNo} is now "${updated.status}".`);
        }
      });
  }

  private markLapsed(row: InsurancePolicy): void {
    openConfirmDialog(this.dialogs, {
      title: 'Mark policy as lapsed',
      message: `Premium for ${row.policyNo} (${row.bankName}) was not renewed. Mark the policy as lapsed?`,
      confirmLabel: 'Mark lapsed',
      danger: true,
    }).subscribe((ok) => {
      if (ok) {
        this.store.update({ ...row, status: 'Lapsed' });
        this.toaster.warn(`${row.policyNo} marked as lapsed.`);
      }
    });
  }
}
