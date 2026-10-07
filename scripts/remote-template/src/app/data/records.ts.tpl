import { TableColumn } from '@samyak/shared-ui';
import json from './records.json';

/**
 * Everything that describes THIS module's data lives here.
 * (Generated sample: replace the JSON, the interface and the columns with your module's real fields.)
 *
 * The data is a JSON file in this remote's own source, imported in TypeScript
 * (tsconfig "resolveJsonModule"). It is bundled into this remote's JS, so it
 * works inside the shell. (Fetching "/assets/x.json" would hit the SHELL's
 * origin and fail.)
 */
export interface ModuleRecord {
  id: string;
  name: string;
  category: string;
  amount: number;
  status: string;
  createdOn: string;
}

export const RECORDS: ModuleRecord[] = json;

/** Columns for the shared table (and labels for the detail page). */
export const COLUMNS: TableColumn[] = [
  { field: 'id', header: 'ID', sortable: true },
  { field: 'name', header: 'Bank', sortable: true },
  { field: 'category', header: 'Category', sortable: true },
  { field: 'amount', header: 'Amount', type: 'currency', sortable: true },
  { field: 'status', header: 'Status', type: 'status', sortable: true },
  { field: 'createdOn', header: 'Created On', type: 'date', sortable: true },
];

export const MODULE_INFO = {
  title: '__TITLE__',
  icon: '__ICON__',
  listTitle: 'Records',
  /** Singular name of one record. */
  recordLabel: 'Record',
  /** Field shown as the heading on the detail page. */
  titleField: 'name',
  /** Field the dashboard groups by to build its stat cards. */
  statusField: 'status',
} as const;
