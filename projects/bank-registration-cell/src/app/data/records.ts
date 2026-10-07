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
export interface BankRegistration {
  id: string;
  bankName: string;
  regNo: string;
  state: string;
  status: string;
  submittedOn: string;
}

export const RECORDS: BankRegistration[] = json;

/** Columns for the shared table (and labels for the detail page). */
export const COLUMNS: TableColumn[] = [
  { field: 'id', header: 'ID', sortable: true },
  { field: 'bankName', header: 'Bank', sortable: true },
  { field: 'regNo', header: 'Registration No.', sortable: true },
  { field: 'state', header: 'State', sortable: true },
  { field: 'status', header: 'Status', type: 'status', sortable: true },
  { field: 'submittedOn', header: 'Submitted On', type: 'date', sortable: true },
];

export const MODULE_INFO = {
  title: 'Bank Registration Cell',
  icon: 'pi pi-building-columns',
  listTitle: 'Registrations',
  /** Singular name of one record, e.g. "Registration". */
  recordLabel: 'Registration',
  /** Field shown as the heading on the detail page. */
  titleField: 'bankName',
  /** Field the dashboard groups by to build its stat cards. */
  statusField: 'status',
} as const;
