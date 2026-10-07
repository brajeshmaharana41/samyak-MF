import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { User } from '../user.model';

/** Edit dialog owned by the SHELL (module-specific dialogs never go in the shared lib). */
@Component({
  selector: 'app-user-edit-dialog',
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, SelectModule],
  templateUrl: './user-edit-dialog.component.html',
  styleUrl: './user-edit-dialog.component.scss',
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
