import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { RECORDS } from '../../data/records';
import { EditRegistrationDialogComponent } from './edit-registration-dialog.component';

describe('EditRegistrationDialogComponent', () => {
  const record = RECORDS[0];
  let fixture: ComponentFixture<EditRegistrationDialogComponent>;
  let el: HTMLElement;
  const ref = { close: vi.fn() };

  beforeEach(async () => {
    ref.close.mockReset();
    await TestBed.configureTestingModule({
      imports: [EditRegistrationDialogComponent],
      providers: [
        { provide: DynamicDialogRef, useValue: ref },
        { provide: DynamicDialogConfig, useValue: { data: record } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditRegistrationDialogComponent);
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  const type = (selector: string, value: string) => {
    const input = el.querySelector<HTMLInputElement>(selector)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };

  it('is pre-filled with the record', () => {
    expect(el.querySelector<HTMLInputElement>('#bankName')?.value).toBe(record.bankName);
    expect(el.querySelector<HTMLInputElement>('#regNo')?.value).toBe(record.regNo);
  });

  it('closes with the edited record on save', () => {
    type('#bankName', 'Renamed Bank');
    el.querySelector('form')!.dispatchEvent(new Event('submit'));

    expect(ref.close).toHaveBeenCalledWith({ ...record, bankName: 'Renamed Bank' });
  });

  it('disables Save while a required field is empty', () => {
    type('#bankName', '');
    expect(el.querySelector<HTMLButtonElement>('p-button[type="submit"] button')?.disabled).toBe(true);
  });

  it('closes with nothing on Cancel', () => {
    el.querySelector<HTMLButtonElement>('p-button[label="Cancel"] button')!.click();
    expect(ref.close).toHaveBeenCalledWith();
  });
});
