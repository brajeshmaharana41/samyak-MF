import { Component, computed, inject, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CurrencyInrPipe, PageHeaderComponent, StatusBadgeComponent } from '@samyak/shared-ui';
import { COLUMNS, MODULE_INFO } from '../../data/records';
import { RecordsStore } from '../../data/records.store';

/**
 * Detail page, reached from the list's navigate action:
 *   router.navigate([row.id], { relativeTo: route })  ->  records/:id
 * The id arrives as an input (route param binding) and is looked up in this module's data.
 */
@Component({
  selector: 'rmc-detail-page',
  imports: [DatePipe, CurrencyInrPipe, PageHeaderComponent, StatusBadgeComponent],
  templateUrl: './detail.page.html',
  styleUrl: './detail.page.scss',
})
export class DetailPage {
  /** Bound from the :id route parameter. */
  readonly id = input.required<string>();

  private readonly store = inject(RecordsStore);
  protected readonly info = MODULE_INFO;
  protected readonly columns = COLUMNS;

  protected readonly record = computed(() => this.store.getById(this.id()) as unknown as Record<string, any> | undefined);
  protected readonly heading = computed(() => this.record()?.[this.info.titleField] ?? 'Not found');
}
