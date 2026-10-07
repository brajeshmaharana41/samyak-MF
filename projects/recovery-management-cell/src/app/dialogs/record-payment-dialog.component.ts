import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CurrencyInrPipe } from '@samyak/shared-ui';
import { RecoveryCase } from '../data/records';

/**
 * RMC-owned dialog: record a recovery payment against a case.
 * Closes with the updated case (outstanding reduced, recovered increased).
 */
@Component({
  selector: 'rmc-record-payment-dialog',
  imports: [ReactiveFormsModule, ButtonModule, InputNumberModule, DatePickerModule, CurrencyInrPipe],
  template: `
    <form [formGroup]="form" (ngSubmit)="save()" class="dialog-form">
      <p class="info">{{ recoveryCase.caseId }} &middot; outstanding {{ recoveryCase.outstanding | currencyInr }}</p>

      <label for="amount">Amount received (INR)</label>
      <p-inputnumber inputId="amount" formControlName="amount" mode="currency" currency="INR" locale="en-IN" [min]="1" [max]="recoveryCase.outstanding" />

      <label for="receivedOn">Received on</label>
      <p-datepicker inputId="receivedOn" formControlName="receivedOn" dateFormat="dd M yy" appendTo="body" />

      <div class="buttons">
        <p-button label="Cancel" severity="secondary" [text]="true" (onClick)="ref.close()" />
        <p-button type="submit" label="Record payment" icon="pi pi-check" [disabled]="form.invalid" />
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
