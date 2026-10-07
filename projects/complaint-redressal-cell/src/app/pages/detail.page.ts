import { Component, computed, inject, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { CurrencyInrPipe, PageHeaderComponent, StatusBadgeComponent } from '@samyak/shared-ui';
import { COLUMNS, MODULE_INFO } from '../data/records';
import { RecordsStore } from '../data/records.store';

/**
 * Detail page, reached from the list's navigate action:
 *   router.navigate([row.id], { relativeTo: route })  ->  records/:id
 * The id arrives as an input (route param binding) and is looked up in this module's data.
 */
@Component({
  selector: 'crc-detail-page',
  imports: [DatePipe, CurrencyInrPipe, PageHeaderComponent, StatusBadgeComponent],
  template: `
    <samyak-page-header
      [title]="heading()"
      [subtitle]="info.recordLabel + ' ' + id()"
      backLink=".."
      [backLabel]="'Back to ' + info.listTitle"
    />

    @if (record(); as r) {
      <dl class="card">
        @for (col of columns; track col.field) {
          <dt>{{ col.header }}</dt>
          <dd>
            @switch (col.type) {
              @case ('date') { {{ r[col.field] | date: 'dd MMM yyyy' }} }
              @case ('currency') { {{ r[col.field] | currencyInr }} }
              @case ('status') { <samyak-status-badge [status]="r[col.field]" /> }
              @default { {{ r[col.field] }} }
            }
          </dd>
        }
      </dl>
    } @else {
      <p>No {{ info.recordLabel.toLowerCase() }} found with id "{{ id() }}".</p>
    }
  `,
  styles: `
    .card { display: grid; grid-template-columns: minmax(8rem, 14rem) 1fr; gap: .9rem 1.5rem; background: #fff; padding: 1.5rem; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,.08); margin: 0; }
    dt { color: #6b7280; }
    dd { margin: 0; font-weight: 500; }
  `,
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
