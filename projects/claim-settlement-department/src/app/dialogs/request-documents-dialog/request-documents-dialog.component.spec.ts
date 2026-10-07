import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { RECORDS } from '../../data/records';
import { RequestDocumentsDialogComponent } from './request-documents-dialog.component';

describe('RequestDocumentsDialogComponent', () => {
  const claim = RECORDS[0];
  let fixture: ComponentFixture<RequestDocumentsDialogComponent>;
  let el: HTMLElement;
  const ref = { close: vi.fn() };

  beforeEach(async () => {
    ref.close.mockReset();
    await TestBed.configureTestingModule({
      imports: [RequestDocumentsDialogComponent],
      providers: [
        { provide: DynamicDialogRef, useValue: ref },
        { provide: DynamicDialogConfig, useValue: { data: claim } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RequestDocumentsDialogComponent);
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  const form = () => fixture.componentInstance['form'];

  it('shows which claim the request is for and pre-selects KYC', () => {
    expect(el.querySelector('.info')?.textContent).toContain(claim.claimId);
    expect(form().controls.documents.value).toEqual(['KYC (Aadhaar / PAN)']);
  });

  it('closes with the selected documents on Send', () => {
    form().controls.documents.setValue(['Passbook copy', 'Cancelled cheque']);
    el.querySelector('form')!.dispatchEvent(new Event('submit'));

    expect(ref.close).toHaveBeenCalledWith(['Passbook copy', 'Cancelled cheque']);
  });

  it('disables Send when no document is selected', () => {
    form().controls.documents.setValue([]);
    fixture.detectChanges();
    expect(el.querySelector<HTMLButtonElement>('p-button[type="submit"] button')?.disabled).toBe(true);
  });

  it('closes with nothing on Cancel', () => {
    el.querySelector<HTMLButtonElement>('p-button[label="Cancel"] button')!.click();
    expect(ref.close).toHaveBeenCalledWith();
  });
});
