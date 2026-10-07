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
export interface InsurancePolicy {
  id: string;
  policyNo: string;
  bankName: string;
  premium: number;
  period: string;
  status: string;
}

export const RECORDS: InsurancePolicy[] = json;

/** Columns for the shared table (and labels for the detail page). */
export const COLUMNS: TableColumn[] = [
  { field: 'policyNo', header: 'Policy No.', sortable: true },
  { field: 'bankName', header: 'Bank', sortable: true },
  { field: 'premium', header: 'Premium', type: 'currency', sortable: true },
  { field: 'period', header: 'Period' },
  { field: 'status', header: 'Status', type: 'status', sortable: true },
];

export const MODULE_INFO = {
  title: 'Insurance Operation Department',
  icon: 'pi pi-shield',
  listTitle: 'Policies',
  /** Singular name of one record. */
  recordLabel: 'Policy',
  /** Field shown as the heading on the detail page. */
  titleField: 'policyNo',
  /** Field the dashboard groups by to build its stat cards. */
  statusField: 'status',
} as const;

export const POLICY_STATUSES = ['Active', 'Pending', 'Renewal Due', 'Lapsed'];
