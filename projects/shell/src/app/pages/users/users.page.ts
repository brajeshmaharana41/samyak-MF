import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { ToasterService } from '@samyak/shared-services';
import {
  DataTableComponent,
  PageHeaderComponent,
  TableAction,
  TableActionEvent,
  TableColumn,
  openConfirmDialog,
} from '@samyak/shared-ui';
import { USERS, User } from './user.model';
import { UserEditDialogComponent } from './user-edit-dialog.component';

/**
 * Users page (owned by the shell). Uses the SAME shared table as every module,
 * with its own columns, data and actions. All action handling lives here.
 */
@Component({
  selector: 'app-users-page',
  imports: [PageHeaderComponent, DataTableComponent],
  // DialogService is provided per page so its dialogs attach to this page.
  providers: [DialogService],
  template: `
    <div class="page">
      <samyak-page-header title="Users" subtitle="Shell-owned page using the shared table" backLink="/home" />
      <samyak-data-table [columns]="columns" [data]="users()" [actions]="actions" (actionClick)="onAction($event)" />
    </div>
  `,
  styles: `.page { max-width: 1200px; margin: 0 auto; padding: 1.5rem 1rem; }`,
})
export class UsersPage {
  private readonly dialogs = inject(DialogService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toaster = inject(ToasterService);

  protected readonly users = signal<User[]>([...USERS]);

  protected readonly columns: TableColumn[] = [
    { field: 'id', header: 'ID', sortable: true },
    { field: 'name', header: 'Name', sortable: true },
    { field: 'role', header: 'Role', sortable: true },
    { field: 'department', header: 'Department', sortable: true },
    { field: 'status', header: 'Status', type: 'status', sortable: true },
  ];

  protected readonly actions: TableAction[] = [
    { key: 'edit', label: 'Edit', icon: 'pi pi-pencil' },
    { key: 'view', label: 'View', icon: 'pi pi-eye' },
    { key: 'disable', label: 'Disable', icon: 'pi pi-ban', visible: (u: User) => u.status !== 'Disabled' },
  ];

  /** The table told us which action was clicked. WE decide what it means. */
  protected onAction({ action, row }: TableActionEvent<User>): void {
    switch (action) {
      case 'edit':
        return this.edit(row);
      case 'view':
        // Navigate relative to this page: /users -> /users/U001
        this.router.navigate([row.id], { relativeTo: this.route });
        return;
      case 'disable':
        return this.disable(row);
    }
  }

  private edit(user: User): void {
    this.dialogs
      .open(UserEditDialogComponent, { header: `Edit ${user.name}`, data: { user }, modal: true, width: '30rem' })
      ?.onClose.subscribe((updated?: User) => {
        if (updated) {
          this.users.update((list) => list.map((u) => (u.id === updated.id ? updated : u)));
          this.toaster.success(`${updated.name} updated.`);
        }
      });
  }

  private disable(user: User): void {
    openConfirmDialog(this.dialogs, {
      title: 'Disable user',
      message: `Disable ${user.name}? They will no longer be able to sign in.`,
      confirmLabel: 'Disable',
      danger: true,
    }).subscribe((ok) => {
      if (ok) {
        this.users.update((list) => list.map((u) => (u.id === user.id ? { ...u, status: 'Disabled' } : u)));
        this.toaster.warn(`${user.name} has been disabled.`);
      }
    });
  }
}
