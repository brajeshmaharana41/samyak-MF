import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { TextareaModule } from 'primeng/textarea';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DepositorClaim } from '../../data/records';

/** CSD-owned dialog: ask the depositor for missing documents. Closes with the list requested. */
@Component({
  selector: 'csd-request-documents-dialog',
  imports: [ReactiveFormsModule, ButtonModule, MultiSelectModule, TextareaModule],
  templateUrl: './request-documents-dialog.component.html',
  styleUrl: './request-documents-dialog.component.scss',
})
export class RequestDocumentsDialogComponent {
  protected readonly ref = inject(DynamicDialogRef);
  protected readonly claim = inject(DynamicDialogConfig).data as DepositorClaim;
  protected readonly documentTypes = ['KYC (Aadhaar / PAN)', 'Passbook copy', 'Cancelled cheque', 'Nominee declaration', 'Legal heir certificate'];

  protected readonly form = new FormGroup({
    documents: new FormControl<string[]>(['KYC (Aadhaar / PAN)'], { nonNullable: true, validators: [Validators.required] }),
    note: new FormControl('', { nonNullable: true }),
  });

  protected send(): void {
    this.ref.close(this.form.controls.documents.value);
  }
}
