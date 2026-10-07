import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InsurancePolicy, POLICY_STATUSES } from '../data/records';

/** IOD-owned dialog: change a policy's status with a remark. */
@Component({
  selector: 'iod-update-status-dialog',
  imports: [ReactiveFormsModule, ButtonModule, SelectModule, TextareaModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="save()" class="dialog-form">
      <p class="info">{{ policy.bankName }} &middot; {{ policy.policyNo }}</p>

      <label for="status">New status</label>
      <p-select inputId="status" formControlName="status" [options]="statuses" appendTo="body" />

      <label for="remarks">Remarks</label>
      <textarea id="remarks" pTextarea rows="3" formControlName="remarks" placeholder="Reason for the change"></textarea>

      <div class="buttons">
        <p-button label="Cancel" severity="secondary" [text]="true" (onClick)="ref.close()" />
        <p-button type="submit" label="Update" icon="pi pi-check" [disabled]="form.invalid" />
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
export class UpdateStatusDialogComponent {
  protected readonly ref = inject(DynamicDialogRef);
  protected readonly policy = inject(DynamicDialogConfig).data as InsurancePolicy;
  protected readonly statuses = POLICY_STATUSES;

  protected readonly form = new FormGroup({
    status: new FormControl(this.policy.status, { nonNullable: true, validators: [Validators.required] }),
    remarks: new FormControl('', { nonNullable: true }),
  });

  protected save(): void {
    this.ref.close({ ...this.policy, status: this.form.controls.status.value });
  }
}
