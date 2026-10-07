import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { BankRegistration } from '../../data/records';

/**
 * BRC-owned dialog. It belongs to this module only, so it lives here,
 * NOT in the shared library. It closes with the updated record (or nothing on cancel).
 */
@Component({
  selector: 'brc-edit-registration-dialog',
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, SelectModule],
  templateUrl: './edit-registration-dialog.component.html',
  styleUrl: './edit-registration-dialog.component.scss',
})
export class EditRegistrationDialogComponent {
  protected readonly ref = inject(DynamicDialogRef);
  private readonly record = inject(DynamicDialogConfig).data as BankRegistration;

  protected readonly states = [
    'Delhi', 'Gujarat', 'Karnataka', 'Kerala', 'Maharashtra', 'Rajasthan', 'Tamil Nadu', 'Uttar Pradesh', 'West Bengal',
  ];

  protected readonly form = new FormGroup({
    bankName: new FormControl(this.record.bankName, { nonNullable: true, validators: [Validators.required] }),
    regNo: new FormControl(this.record.regNo, { nonNullable: true, validators: [Validators.required] }),
    state: new FormControl(this.record.state, { nonNullable: true, validators: [Validators.required] }),
  });

  protected save(): void {
    this.ref.close({ ...this.record, ...this.form.getRawValue() });
  }
}
