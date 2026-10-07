import { TableColumn } from '@samyak/shared-ui';
import json from './records.json';

/**
 * Everything that describes THIS module's data lives here.
 *
 * The data is a JSON file in this remote's own source, imported in TypeScript
 * (tsconfig "resolveJsonModule"). It is bundled into this remote's JS, so it
 * works inside the shell. (Fetching "/assets/x.json" would hit the SHELL's
 * origin and fail.)
 */
export interface RiskPremium {
  id: string;
  bankName: string;
  /** 0-100, higher = safer bank. */
  riskScore: number;
  grade: string;
  /** Premium in paise per ₹100 of assessable deposits. */
  premiumRate: number;
  effectiveFrom: string;
}

export const RECORDS: RiskPremium[] = json;

/** Columns for the shared table (and labels for the detail page). */
export const COLUMNS: TableColumn[] = [
  { field: 'bankName', header: 'Bank', sortable: true },
  { field: 'riskScore', header: 'Risk Score', sortable: true },
  { field: 'grade', header: 'Grade', type: 'status', sortable: true },
  { field: 'premiumRate', header: 'Premium (paise / ₹100)', sortable: true },
  { field: 'effectiveFrom', header: 'Effective From', type: 'date', sortable: true },
];

export const MODULE_INFO = {
  title: 'Risk Based Premium',
  icon: 'pi pi-chart-line',
  listTitle: 'Bank Ratings',
  /** Singular name of one record. */
  recordLabel: 'Rating',
  /** Field shown as the heading on the detail page. */
  titleField: 'bankName',
  /** Field the dashboard groups by to build its stat cards. */
  statusField: 'grade',
} as const;

export const GRADES = ['A', 'B', 'C', 'D'];

/** Premium rate (paise per ₹100) charged for each grade. */
export const RATE_BY_GRADE: Record<string, number> = { A: 10, B: 12, C: 13, D: 15 };

/** Mock rating model: score -> grade. */
export function gradeFor(score: number): string {
  if (score >= 80) return 'A';
  if (score >= 65) return 'B';
  if (score >= 50) return 'C';
  return 'D';
}
