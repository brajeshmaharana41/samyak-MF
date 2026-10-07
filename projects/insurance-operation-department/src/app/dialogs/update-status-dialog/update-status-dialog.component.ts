import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InsurancePolicy, POLICY_STATUSES } from '../../data/records';

/** IOD-owned dialog: change a policy's status with a remark. */
@Component({
  selector: 'iod-update-status-dialog',
  imports: [ReactiveFormsModule, ButtonModule, SelectModule, TextareaModule],
  templateUrl: './update-status-dialog.component.html',
  styleUrl: './update-status-dialog.component.scss',
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
