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
