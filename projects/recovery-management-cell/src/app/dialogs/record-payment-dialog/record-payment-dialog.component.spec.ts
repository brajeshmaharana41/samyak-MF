import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { RECORDS } from '../../data/records';
import { RecordPaymentDialogComponent } from './record-payment-dialog.component';

describe('RecordPaymentDialogComponent', () => {
  /** A case with money still outstanding. */
  const recoveryCase = RECORDS.find((c) => c.status === 'Open')!;
  let fixture: ComponentFixture<RecordPaymentDialogComponent>;
  let el: HTMLElement;
  const ref = { close: vi.fn() };

  beforeEach(async () => {
    ref.close.mockReset();
    await TestBed.configureTestingModule({
      imports: [RecordPaymentDialogComponent],
      providers: [
        { provide: DynamicDialogRef, useValue: ref },
        { provide: DynamicDialogConfig, useValue: { data: recoveryCase } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RecordPaymentDialogComponent);
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  const form = () => fixture.componentInstance['form'];
  const submit = () => el.querySelector('form')!.dispatchEvent(new Event('submit'));

  it('shows the case and suggests an amount no larger than what is outstanding', () => {
    expect(el.querySelector('.info')?.textContent).toContain(recoveryCase.caseId);
    expect(form().controls.amount.value).toBe(Math.min(1000000, recoveryCase.outstanding));
  });

  it('closes with a partially recovered case for a part payment', () => {
    form().controls.amount.setValue(1000);
    submit();

    expect(ref.close).toHaveBeenCalledWith({
      ...recoveryCase,
      outstanding: recoveryCase.outstanding - 1000,
      recovered: recoveryCase.recovered + 1000,
      status: 'Partially Recovered',
    });
  });

  it('closes with a fully recovered case when everything is paid', () => {
    form().controls.amount.setValue(recoveryCase.outstanding);
    submit();

    expect(ref.close).toHaveBeenCalledWith(expect.objectContaining({ outstanding: 0, status: 'Fully Recovered' }));
  });

  it('rejects an amount larger than what is outstanding', () => {
    form().controls.amount.setValue(recoveryCase.outstanding + 1);
    fixture.detectChanges();
    expect(el.querySelector<HTMLButtonElement>('p-button[type="submit"] button')?.disabled).toBe(true);
  });

  it('closes with nothing on Cancel', () => {
    el.querySelector<HTMLButtonElement>('p-button[label="Cancel"] button')!.click();
    expect(ref.close).toHaveBeenCalledWith();
  });
});
