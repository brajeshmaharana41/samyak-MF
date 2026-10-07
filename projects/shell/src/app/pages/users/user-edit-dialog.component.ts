import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { User } from './user.model';

/** Edit dialog owned by the SHELL (module-specific dialogs never go in the shared lib). */
@Component({
  selector: 'app-user-edit-dialog',
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, SelectModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="save()" class="dialog-form">
      <label for="name">Name</label>
      <input id="name" pInputText formControlName="name" />

      <label for="role">Role</label>
      <p-select inputId="role" formControlName="role" [options]="roles" appendTo="body" />

      <label for="department">Department</label>
      <input id="department" pInputText formControlName="department" />

      <div class="buttons">
        <p-button label="Cancel" severity="secondary" [text]="true" (onClick)="ref.close()" />
        <p-button type="submit" label="Save" icon="pi pi-check" [disabled]="form.invalid" />
      </div>
    </form>
  `,
  styles: `
    .dialog-form { display: flex; flex-direction: column; gap: 0.4rem; }
    label { font-weight: 500; margin-top: 0.5rem; }
    .buttons { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1.25rem; }
  `,
})
export class UserEditDialogComponent {
  protected readonly ref = inject(DynamicDialogRef);
  private readonly user = (inject(DynamicDialogConfig).data as { user: User }).user;

  protected readonly roles = ['Administrator', 'Manager', 'Officer', 'Analyst', 'Auditor', 'Clerk'];

  protected readonly form = new FormGroup({
    name: new FormControl(this.user.name, { nonNullable: true, validators: [Validators.required] }),
    role: new FormControl(this.user.role, { nonNullable: true, validators: [Validators.required] }),
    department: new FormControl(this.user.department, { nonNullable: true, validators: [Validators.required] }),
  });

  protected save(): void {
    this.ref.close({ ...this.user, ...this.form.getRawValue() });
  }
}
