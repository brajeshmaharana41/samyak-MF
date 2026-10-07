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
export interface Complaint {
  id: string;
  ticketNo: string;
  complainant: string;
  category: string;
  priority: string;
  raisedOn: string;
  assignedTo: string;
  state: string;
}

export const RECORDS: Complaint[] = json;

/** Columns for the shared table (and labels for the detail page). */
export const COLUMNS: TableColumn[] = [
  { field: 'ticketNo', header: 'Ticket No.', sortable: true },
  { field: 'complainant', header: 'Complainant', sortable: true },
  { field: 'category', header: 'Category', sortable: true },
  { field: 'priority', header: 'Priority', type: 'status', sortable: true },
  { field: 'raisedOn', header: 'Raised On', type: 'date', sortable: true },
  { field: 'assignedTo', header: 'Assigned To', sortable: true },
  { field: 'state', header: 'State', type: 'status', sortable: true },
];

export const MODULE_INFO = {
  title: 'Complaint Redressal Cell',
  icon: 'pi pi-comments',
  listTitle: 'Complaints',
  /** Singular name of one record. */
  recordLabel: 'Complaint',
  /** Field shown as the heading on the detail page. */
  titleField: 'ticketNo',
  /** Field the dashboard groups by to build its stat cards. */
  statusField: 'priority',
} as const;

/** Officers a complaint can be assigned to. */
export const OFFICERS = ['Priya Nair', 'Rahul Verma', 'Deepa Menon', 'Arjun Reddy', 'Kavita Joshi'];
