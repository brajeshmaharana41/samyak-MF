import { Pipe, PipeTransform } from '@angular/core';

const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

/** 1250000 -> "₹12,50,000" (Indian digit grouping). */
@Pipe({ name: 'currencyInr' })
export class CurrencyInrPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    const n = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(n) ? formatter.format(n) : String(value);
  }
}
