/**
 * DataTableComponent — THE shared table used by the shell and every remote.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ RULE: this component has NO business logic.                              │
 * │                                                                          │
 * │ It renders columns, rows, search, sorting, paging and a per-row action   │
 * │ menu. When the user picks an action it only REPORTS it:                  │
 * │                                                                          │
 * │     actionClick.emit({ action: 'edit', row })                            │
 * │                                                                          │
 * │ The PARENT PAGE decides what "edit" means: open its own dialog, navigate │
 * │ to a detail page, or ask for confirmation. That is why the same table    │
 * │ can serve Bank Registration, Claims, Users... each with different data   │
 * │ and different actions.                                                   │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * Usage:
 *   <samyak-data-table [columns]="columns" [data]="rows" [actions]="actions"
 *                      (actionClick)="onAction($event)" />
 */
import { Component, input, output, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Menu, MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { TableAction, TableActionEvent, TableColumn } from './table.model';
import { CurrencyInrPipe } from '../pipes/currency-inr.pipe';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

@Component({
  selector: 'samyak-data-table',
  imports: [
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    MenuModule,
    DatePipe,
    CurrencyInrPipe,
    StatusBadgeComponent,
  ],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
})
export class DataTableComponent {
  // ---- Inputs: everything the table shows comes from the parent page ----
  readonly columns = input.required<TableColumn[]>();
  readonly data = input.required<any[]>();
  readonly actions = input<TableAction[]>([]);
  readonly pageSize = input(10);
  /** Optional property used as the row key (defaults to "id"). */
  readonly dataKey = input('id');

  // ---- Output: the table only reports which action was clicked on which row ----
  readonly actionClick = output<TableActionEvent>();

  /** One popup menu is reused for all rows; we fill it with the clicked row's actions. */
  private readonly menu = viewChild.required<Menu>('rowMenu');

  protected globalFilterFields(): string[] {
    return this.columns().map((c) => c.field);
  }

  protected openRowMenu(event: Event, row: any): void {
    const items: MenuItem[] = this.actions()
      .filter((a) => !a.visible || a.visible(row))
      .map((a) => ({
        label: a.label,
        icon: a.icon,
        // Just report the click. No decisions here.
        command: () => this.actionClick.emit({ action: a.key, row }),
      }));

    this.menu().model = items.length ? items : [{ label: 'No actions', disabled: true }];
    this.menu().toggle(event);
  }
}
