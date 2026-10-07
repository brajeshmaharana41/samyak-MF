/**
 * The contract between a page and the shared DataTableComponent.
 * Pages describe WHAT to show (columns, data, actions); the table only renders it.
 */

/** How a cell value is displayed. */
export type ColumnType = 'text' | 'date' | 'currency' | 'status';

export interface TableColumn {
  /** Property name in the row object, e.g. "bankName". */
  field: string;
  /** Column header text. */
  header: string;
  sortable?: boolean;
  /** Defaults to 'text'. 'currency' = INR, 'status' = coloured badge. */
  type?: ColumnType;
}

export interface TableAction {
  /** Identifier the page receives in actionClick, e.g. "edit". */
  key: string;
  label: string;
  /** PrimeIcons class, e.g. "pi pi-pencil". */
  icon?: string;
  /** Hide the action for some rows, e.g. "Approve" only when status is Pending. */
  visible?: (row: any) => boolean;
}

/** Emitted by the table when a user picks an action from a row's menu. */
export interface TableActionEvent<T = any> {
  action: string;
  row: T;
}
