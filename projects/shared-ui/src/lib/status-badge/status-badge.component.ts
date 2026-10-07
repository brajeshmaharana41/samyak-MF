import { Component, computed, input } from '@angular/core';
import { TagModule } from 'primeng/tag';
import { StatusLabelPipe } from '../pipes/status-label.pipe';

type Severity = 'success' | 'info' | 'warn' | 'danger' | 'secondary';

/** Words that decide the badge colour. Checked in order; first match wins. */
const SEVERITY_RULES: Array<[RegExp, Severity]> = [
  [/reject|disabled|inactive|overdue|lapsed|expired|written|critical|high|^d$/i, 'danger'],
  [/pending|review|progress|open|medium|partial|due|verif|hold|^c$/i, 'warn'],
  [/approved|active|paid|settled|resolved|recovered|closed|low|^a$/i, 'success'],
  [/new|received|submitted|draft|assigned|scheduled|^b$/i, 'info'],
];

/** A coloured PrimeNG tag for status-like values (Approved, Pending, High...). */
@Component({
  selector: 'samyak-status-badge',
  imports: [TagModule, StatusLabelPipe],
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss',
})
export class StatusBadgeComponent {
  readonly status = input.required<string>();

  protected readonly severity = computed<Severity>(() => {
    const value = this.status() ?? '';
    return SEVERITY_RULES.find(([pattern]) => pattern.test(value))?.[1] ?? 'secondary';
  });
}
