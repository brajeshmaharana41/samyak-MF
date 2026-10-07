import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { GRADES, RATE_BY_GRADE, RiskPremium } from '../data/records';

/** RBP-owned dialog: manually override a bank's grade (with justification). */
@Component({
  selector: 'rbp-override-grade-dialog',
  imports: [ReactiveFormsModule, ButtonModule, SelectModule, TextareaModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="save()" class="dialog-form">
      <p class="info">{{ rating.bankName }} &middot; score {{ rating.riskScore }}, current grade {{ rating.grade }}</p>

      <label for="grade">New grade</label>
      <p-select inputId="grade" formControlName="grade" [options]="grades" appendTo="body" />
      <small>Premium rate becomes {{ rates[form.controls.grade.value] }} paise per ₹100.</small>

      <label for="reason">Justification</label>
      <textarea id="reason" pTextarea rows="3" formControlName="reason" placeholder="Required"></textarea>

      <div class="buttons">
        <p-button label="Cancel" severity="secondary" [text]="true" (onClick)="ref.close()" />
        <p-button type="submit" label="Override" icon="pi pi-check" [disabled]="form.invalid" />
      </div>
    </form>
  `,
  styles: `
    .dialog-form { display: flex; flex-direction: column; gap: .4rem; }
    .info { margin: 0 0 .5rem; color: #6b7280; }
    label { font-weight: 500; margin-top: .5rem; }
    small { color: #6b7280; }
    .buttons { display: flex; justify-content: flex-end; gap: .5rem; margin-top: 1.25rem; }
  `,
})
export class OverrideGradeDialogComponent {
  protected readonly ref = inject(DynamicDialogRef);
  protected readonly rating = inject(DynamicDialogConfig).data as RiskPremium;
  protected readonly grades = GRADES;
  protected readonly rates = RATE_BY_GRADE;

  protected readonly form = new FormGroup({
    grade: new FormControl(this.rating.grade, { nonNullable: true, validators: [Validators.required] }),
    reason: new FormControl('Supervisory review', { nonNullable: true, validators: [Validators.required] }),
  });

  protected save(): void {
    const grade = this.form.controls.grade.value;
    this.ref.close({ ...this.rating, grade, premiumRate: RATE_BY_GRADE[grade] } satisfies RiskPremium);
  }
}
