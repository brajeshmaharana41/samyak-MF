import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Complaint, OFFICERS } from '../data/records';

/** CRC-owned dialog: assign a complaint to an officer and set its priority. */
@Component({
  selector: 'crc-assign-complaint-dialog',
  imports: [ReactiveFormsModule, ButtonModule, SelectModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="save()" class="dialog-form">
      <p class="info">{{ complaint.ticketNo }} &middot; {{ complaint.category }}</p>

      <label for="officer">Assign to</label>
      <p-select inputId="officer" formControlName="assignedTo" [options]="officers" placeholder="Choose an officer" appendTo="body" />

      <label for="priority">Priority</label>
      <p-select inputId="priority" formControlName="priority" [options]="priorities" appendTo="body" />

      <div class="buttons">
        <p-button label="Cancel" severity="secondary" [text]="true" (onClick)="ref.close()" />
        <p-button type="submit" label="Assign" icon="pi pi-user-plus" [disabled]="form.invalid" />
      </div>
    </form>
  `,
  styles: `
    .dialog-form { display: flex; flex-direction: column; gap: .4rem; }
    .info { margin: 0 0 .5rem; color: #6b7280; }
    label { font-weight: 500; margin-top: .5rem; }
    .buttons { display: flex; justify-content: flex-end; gap: .5rem; margin-top: 1.25rem; }
  `,
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
