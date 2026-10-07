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
export interface DepositorClaim {
  id: string;
  claimId: string;
  depositor: string;
  amount: number;
  bankName: string;
  stage: string;
}

export const RECORDS: DepositorClaim[] = json;

/** Columns for the shared table (and labels for the detail page). */
export const COLUMNS: TableColumn[] = [
  { field: 'claimId', header: 'Claim ID', sortable: true },
  { field: 'depositor', header: 'Depositor', sortable: true },
  { field: 'amount', header: 'Claim Amount', type: 'currency', sortable: true },
  { field: 'bankName', header: 'Bank', sortable: true },
  { field: 'stage', header: 'Stage', type: 'status', sortable: true },
];

export const MODULE_INFO = {
  title: 'Claim Settlement Department',
  icon: 'pi pi-wallet',
  listTitle: 'Claims',
  /** Singular name of one record. */
  recordLabel: 'Claim',
  /** Field shown as the heading on the detail page. */
  titleField: 'claimId',
  /** Field the dashboard groups by to build its stat cards. */
  statusField: 'stage',
} as const;
