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
import { COLUMNS, MODULE_INFO, RATE_BY_GRADE, RiskPremium, gradeFor } from '../../data/records';
import { RecordsStore } from '../../data/records.store';
import { OverrideGradeDialogComponent } from '../../dialogs/override-grade-dialog/override-grade-dialog.component';

/**
 * RBP list page: the SHARED table with RBP's own columns, data and actions.
 *   recalculate -> shared ConfirmDialog, then recomputes grade and premium
 *   breakdown   -> navigates to the detail page
 *   override    -> opens an RBP-owned dialog
 */
@Component({
  selector: 'rbp-list-page',
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
    { key: 'recalculate', label: 'Recalculate', icon: 'pi pi-calculator' },
    { key: 'breakdown', label: 'View breakdown', icon: 'pi pi-chart-bar' },
    { key: 'override', label: 'Override grade', icon: 'pi pi-sliders-h' },
  ];

  protected onAction({ action, row }: TableActionEvent<RiskPremium>): void {
    switch (action) {
      case 'recalculate':
        return this.recalculate(row);
      case 'breakdown':
        this.router.navigate([row.id], { relativeTo: this.route });
        return;
      case 'override':
        return this.override(row);
    }
  }

  private recalculate(row: RiskPremium): void {
    openConfirmDialog(this.dialogs, {
      title: 'Recalculate premium',
      message: `Re-run the rating model for ${row.bankName}? The grade and premium rate may change.`,
      confirmLabel: 'Recalculate',
    }).subscribe(async (ok) => {
      if (!ok) return;
      await this.loader.flash(700);
      const grade = gradeFor(row.riskScore);
      this.store.update({ ...row, grade, premiumRate: RATE_BY_GRADE[grade] });
      this.toaster.success(`${row.bankName}: grade ${grade}, ${RATE_BY_GRADE[grade]} paise per ₹100.`);
    });
  }

  private override(row: RiskPremium): void {
    this.dialogs
      .open(OverrideGradeDialogComponent, { header: 'Override grade', data: row, modal: true, width: '30rem' })
      ?.onClose.subscribe((updated?: RiskPremium) => {
        if (updated) {
          this.store.update(updated);
          this.toaster.success(`${updated.bankName} overridden to grade ${updated.grade}.`);
        }
      });
  }
}
