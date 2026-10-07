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
export interface RecoveryCase {
  id: string;
  caseId: string;
  bankName: string;
  outstanding: number;
  recovered: number;
  status: string;
}

export const RECORDS: RecoveryCase[] = json;

/** Columns for the shared table (and labels for the detail page). */
export const COLUMNS: TableColumn[] = [
  { field: 'caseId', header: 'Case ID', sortable: true },
  { field: 'bankName', header: 'Bank', sortable: true },
  { field: 'outstanding', header: 'Outstanding', type: 'currency', sortable: true },
  { field: 'recovered', header: 'Recovered', type: 'currency', sortable: true },
  { field: 'status', header: 'Status', type: 'status', sortable: true },
];

export const MODULE_INFO = {
  title: 'Recovery Management Cell',
  icon: 'pi pi-replay',
  listTitle: 'Recovery Cases',
  /** Singular name of one record. */
  recordLabel: 'Case',
  /** Field shown as the heading on the detail page. */
  titleField: 'caseId',
  /** Field the dashboard groups by to build its stat cards. */
  statusField: 'status',
} as const;
