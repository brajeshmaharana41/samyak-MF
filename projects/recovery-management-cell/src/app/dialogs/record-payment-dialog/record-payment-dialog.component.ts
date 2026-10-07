import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CurrencyInrPipe } from '@samyak/shared-ui';
import { RecoveryCase } from '../../data/records';

/**
 * RMC-owned dialog: record a recovery payment against a case.
 * Closes with the updated case (outstanding reduced, recovered increased).
 */
@Component({
  selector: 'rmc-record-payment-dialog',
  imports: [ReactiveFormsModule, ButtonModule, InputNumberModule, DatePickerModule, CurrencyInrPipe],
  templateUrl: './record-payment-dialog.component.html',
  styleUrl: './record-payment-dialog.component.scss',
})
export class RecordPaymentDialogComponent {
  protected readonly ref = inject(DynamicDialogRef);
  protected readonly recoveryCase = inject(DynamicDialogConfig).data as RecoveryCase;

  protected readonly form = new FormGroup({
    amount: new FormControl<number | null>(Math.min(1000000, this.recoveryCase.outstanding), [
      Validators.required,
      Validators.min(1),
      Validators.max(this.recoveryCase.outstanding),
    ]),
    receivedOn: new FormControl<Date>(new Date(), { nonNullable: true, validators: [Validators.required] }),
  });

  protected save(): void {
    const amount = this.form.controls.amount.value ?? 0;
    const outstanding = this.recoveryCase.outstanding - amount;
    this.ref.close({
      ...this.recoveryCase,
      outstanding,
      recovered: this.recoveryCase.recovered + amount,
      status: outstanding === 0 ? 'Fully Recovered' : 'Partially Recovered',
    } satisfies RecoveryCase);
  }
}
