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
import { COLUMNS, MODULE_INFO, ModuleRecord } from '../data/records';
import { RecordsStore } from '../data/records.store';
import { EditRecordDialogComponent } from '../dialogs/edit-record-dialog.component';

/**
 * List page: the SHARED table with this module's own columns, data and actions.
 *
 * The table only emits (actionClick). This page decides what each action does:
 *   edit  -> opens this module's own dialog
 *   view  -> navigates to the detail page
 *   close -> shared ConfirmDialog, then a toast
 */
@Component({
  selector: '__KEY__-list-page',
  imports: [PageHeaderComponent, DataTableComponent],
  // Provide DialogService here so dialogs opened from this remote page work.
  providers: [DialogService],
  template: `
    <samyak-page-header [title]="info.listTitle" [subtitle]="info.title" />
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
    { key: 'edit', label: 'Edit', icon: 'pi pi-pencil' },
    { key: 'view', label: 'View', icon: 'pi pi-eye' },
    { key: 'close', label: 'Close', icon: 'pi pi-lock', visible: (r: ModuleRecord) => r.status !== 'Closed' },
  ];

  protected onAction({ action, row }: TableActionEvent<ModuleRecord>): void {
    switch (action) {
      case 'edit':
        return this.edit(row);
      case 'view':
        // Relative to THIS remote's routes: .../records -> .../records/<id>
        this.router.navigate([row.id], { relativeTo: this.route });
        return;
      case 'close':
        return this.close(row);
    }
  }

  private edit(row: ModuleRecord): void {
    this.dialogs
      .open(EditRecordDialogComponent, { header: `Edit ${row.id}`, data: row, modal: true, width: '32rem' })
      ?.onClose.subscribe((updated?: ModuleRecord) => {
        if (updated) {
          this.store.update(updated);
          this.toaster.success(`${updated.id} updated.`);
        }
      });
  }

  private close(row: ModuleRecord): void {
    openConfirmDialog(this.dialogs, {
      title: 'Close record',
      message: `Close ${row.id} (${row.name})?`,
      confirmLabel: 'Close record',
    }).subscribe((ok) => {
      if (ok) {
        this.store.update({ ...row, status: 'Closed' });
        this.toaster.success(`${row.id} closed.`);
      }
    });
  }
}
