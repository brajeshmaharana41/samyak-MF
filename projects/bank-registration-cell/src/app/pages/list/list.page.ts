import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { LoaderService, ToasterService } from '@samyak/shared-services';
import {
  DataTableComponent,
  PageHeaderComponent,
  TableAction,
  TableActionEvent,
  openConfirmDialog,
} from '@samyak/shared-ui';
import { BankRegistration, COLUMNS, MODULE_INFO } from '../../data/records';
import { RecordsStore } from '../../data/records.store';
import { EditRegistrationDialogComponent } from '../../dialogs/edit-registration-dialog/edit-registration-dialog.component';
import { PreviewCertificateDialogComponent } from '../../certificate/preview-certificate-dialog/preview-certificate-dialog.component';

/**
 * BRC list page: the SHARED table with BRC's own columns, data and actions.
 *
 * The table only emits (actionClick). This page decides what each action does:
 *   edit    -> opens a BRC-owned dialog
 *   view    -> navigates to the detail page
 *   approve -> shared ConfirmDialog, then a toast
 *   certificate -> BRC dialog that renders a PDF with pdfjs-dist (a BRC-only library)
 */
@Component({
  selector: 'brc-list-page',
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
  private readonly loader = inject(LoaderService);
  protected readonly store = inject(RecordsStore);

  protected readonly info = MODULE_INFO;
  protected readonly columns = COLUMNS;

  protected readonly actions: TableAction[] = [
    { key: 'edit', label: 'Edit', icon: 'pi pi-pencil' },
    { key: 'view', label: 'View', icon: 'pi pi-eye' },
    {
      key: 'approve',
      label: 'Approve',
      icon: 'pi pi-check-circle',
      // Only applications that are not decided yet can be approved.
      visible: (r: BankRegistration) => r.status === 'Pending' || r.status === 'Under Review',
    },
    {
      key: 'certificate',
      label: 'Preview certificate',
      icon: 'pi pi-file-pdf',
      visible: (r: BankRegistration) => r.status === 'Approved',
    },
  ];

  protected onAction({ action, row }: TableActionEvent<BankRegistration>): void {
    switch (action) {
      case 'edit':
        return this.edit(row);
      case 'view':
        // Relative to THIS remote's routes: /brc/records -> /brc/records/BRC-001
        this.router.navigate([row.id], { relativeTo: this.route });
        return;
      case 'approve':
        return this.approve(row);
      case 'certificate':
        this.dialogs.open(PreviewCertificateDialogComponent, {
          header: `Registration certificate · ${row.bankName}`,
          data: row,
          modal: true,
          width: '52rem',
          breakpoints: { '900px': '95vw' },
        });
        return;
    }
  }

  private edit(row: BankRegistration): void {
    this.dialogs
      .open(EditRegistrationDialogComponent, { header: `Edit ${row.id}`, data: row, modal: true, width: '32rem' })
      ?.onClose.subscribe(async (updated?: BankRegistration) => {
        if (updated) {
          await this.loader.flash(400);
          this.store.update(updated);
          this.toaster.success(`${updated.bankName} updated.`);
        }
      });
  }

  private approve(row: BankRegistration): void {
    openConfirmDialog(this.dialogs, {
      title: 'Approve registration',
      message: `Approve the registration of ${row.bankName} (${row.regNo})?`,
      confirmLabel: 'Approve',
    }).subscribe((ok) => {
      if (ok) {
        this.store.update({ ...row, status: 'Approved' });
        this.toaster.success(`${row.bankName} approved.`);
      }
    });
  }
}
