import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ModuleRecord } from '../../data/records';

/**
 * Dialog owned by THIS module (module dialogs never go in the shared library).
 * Closes with the updated record, or nothing on cancel.
 */
@Component({
  selector: '__KEY__-edit-record-dialog',
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule],
  templateUrl: './edit-record-dialog.component.html',
  styleUrl: './edit-record-dialog.component.scss',
})
export class EditRecordDialogComponent {
  protected readonly ref = inject(DynamicDialogRef);
  private readonly record = inject(DynamicDialogConfig).data as ModuleRecord;

  protected readonly form = new FormGroup({
    name: new FormControl(this.record.name, { nonNullable: true, validators: [Validators.required] }),
    category: new FormControl(this.record.category, { nonNullable: true, validators: [Validators.required] }),
  });

  protected save(): void {
    this.ref.close({ ...this.record, ...this.form.getRawValue() });
  }
}
