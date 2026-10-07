import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Complaint, OFFICERS } from '../../data/records';

/** CRC-owned dialog: assign a complaint to an officer and set its priority. */
@Component({
  selector: 'crc-assign-complaint-dialog',
  imports: [ReactiveFormsModule, ButtonModule, SelectModule],
  templateUrl: './assign-complaint-dialog.component.html',
  styleUrl: './assign-complaint-dialog.component.scss',
})
export class AssignComplaintDialogComponent {
  protected readonly ref = inject(DynamicDialogRef);
  protected readonly complaint = inject(DynamicDialogConfig).data as Complaint;
  protected readonly officers = OFFICERS;
  protected readonly priorities = ['Low', 'Medium', 'High', 'Critical'];

  protected readonly form = new FormGroup({
    assignedTo: new FormControl(this.complaint.assignedTo || OFFICERS[0], { nonNullable: true, validators: [Validators.required] }),
    priority: new FormControl(this.complaint.priority, { nonNullable: true, validators: [Validators.required] }),
  });

  protected save(): void {
    this.ref.close({ ...this.complaint, ...this.form.getRawValue() });
  }
}
