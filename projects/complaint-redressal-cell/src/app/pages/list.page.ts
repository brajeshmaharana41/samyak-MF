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
import { COLUMNS, Complaint, MODULE_INFO } from '../data/records';
import { RecordsStore } from '../data/records.store';
import { AssignComplaintDialogComponent } from '../dialogs/assign-complaint-dialog.component';

/**
 * CRC list page: the SHARED table with CRC's own columns, data and actions.
 *   assign -> opens a CRC-owned dialog
 *   thread -> navigates to the complaint detail page
 *   close  -> shared ConfirmDialog, then marks the ticket Resolved
 */
@Component({
  selector: 'crc-list-page',
  imports: [PageHeaderComponent, DataTableComponent],
  // Provide DialogService here so dialogs opened from this remote page work.
  providers: [DialogService],
  template: `
    <samyak-page-header [title]="info.listTitle" subtitle="Complaints from depositors and banks" />
    <samyak-data-table [columns]="columns" [data]="store.all()" [actions]="actions" (actionClick)="onAction($event)" />
  `,
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
    { key: 'assign', label: 'Assign', icon: 'pi pi-user-plus', visible: (c: Complaint) => c.state !== 'Resolved' },
    { key: 'thread', label: 'View thread', icon: 'pi pi-comments' },
    { key: 'close', label: 'Close ticket', icon: 'pi pi-check-square', visible: (c: Complaint) => c.state !== 'Resolved' },
  ];

  protected onAction({ action, row }: TableActionEvent<Complaint>): void {
    switch (action) {
      case 'assign':
        return this.assign(row);
      case 'thread':
        this.router.navigate([row.id], { relativeTo: this.route });
        return;
      case 'close':
        return this.closeTicket(row);
    }
  }

  private assign(row: Complaint): void {
    this.dialogs
      .open(AssignComplaintDialogComponent, { header: 'Assign complaint', data: row, modal: true, width: '30rem' })
      ?.onClose.subscribe((updated?: Complaint) => {
        if (updated) {
          this.store.update(updated);
          this.toaster.success(`${updated.ticketNo} assigned to ${updated.assignedTo}.`);
        }
      });
  }

  private closeTicket(row: Complaint): void {
    openConfirmDialog(this.dialogs, {
      title: 'Close ticket',
      message: `Mark ${row.ticketNo} from ${row.complainant} as resolved?`,
      confirmLabel: 'Close ticket',
    }).subscribe((ok) => {
      if (ok) {
        this.store.update({ ...row, state: 'Resolved' });
        this.toaster.success(`${row.ticketNo} resolved.`);
      }
    });
  }
}
