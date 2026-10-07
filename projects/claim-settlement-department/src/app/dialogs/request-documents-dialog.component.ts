import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { TextareaModule } from 'primeng/textarea';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DepositorClaim } from '../data/records';

/** CSD-owned dialog: ask the depositor for missing documents. Closes with the list requested. */
@Component({
  selector: 'csd-request-documents-dialog',
  imports: [ReactiveFormsModule, ButtonModule, MultiSelectModule, TextareaModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="send()" class="dialog-form">
      <p class="info">{{ claim.claimId }} &middot; {{ claim.depositor }}</p>

      <label for="docs">Documents needed</label>
      <p-multiselect inputId="docs" formControlName="documents" [options]="documentTypes" placeholder="Select documents" appendTo="body" display="chip" />

      <label for="note">Note to depositor</label>
      <textarea id="note" pTextarea rows="3" formControlName="note"></textarea>

      <div class="buttons">
        <p-button label="Cancel" severity="secondary" [text]="true" (onClick)="ref.close()" />
        <p-button type="submit" label="Send request" icon="pi pi-send" [disabled]="form.invalid" />
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
