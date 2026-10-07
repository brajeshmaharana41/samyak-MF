import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { GRADES, RATE_BY_GRADE, RiskPremium } from '../../data/records';

/** RBP-owned dialog: manually override a bank's grade (with justification). */
@Component({
  selector: 'rbp-override-grade-dialog',
  imports: [ReactiveFormsModule, ButtonModule, SelectModule, TextareaModule],
  templateUrl: './override-grade-dialog.component.html',
  styleUrl: './override-grade-dialog.component.scss',
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
