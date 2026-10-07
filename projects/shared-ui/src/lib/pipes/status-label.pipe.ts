import { Pipe, PipeTransform } from '@angular/core';

/** "UNDER_REVIEW" / "under-review" / "underReview" -> "Under Review". */
@Pipe({ name: 'statusLabel' })
export class StatusLabelPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '-';
    }
    return value
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_-]+/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();
  }
}
