import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { RECORDS } from '../../data/records';
import { EditRecordDialogComponent } from './edit-record-dialog.component';

describe('EditRecordDialogComponent', () => {
  const record = RECORDS[0];
  let fixture: ComponentFixture<EditRecordDialogComponent>;
  let el: HTMLElement;
  const ref = { close: vi.fn() };

  beforeEach(async () => {
    ref.close.mockReset();
    await TestBed.configureTestingModule({
      imports: [EditRecordDialogComponent],
      providers: [
        { provide: DynamicDialogRef, useValue: ref },
        { provide: DynamicDialogConfig, useValue: { data: record } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditRecordDialogComponent);
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
    expect(el.querySelector<HTMLInputElement>('#name')?.value).toBe(record.name);
    expect(el.querySelector<HTMLInputElement>('#category')?.value).toBe(record.category);
  });

  it('closes with the edited record on save', () => {
    type('#name', 'Renamed');
    el.querySelector('form')!.dispatchEvent(new Event('submit'));

    expect(ref.close).toHaveBeenCalledWith({ ...record, name: 'Renamed' });
  });

  it('disables Save while a required field is empty', () => {
    type('#name', '');
    expect(el.querySelector<HTMLButtonElement>('p-button[type="submit"] button')?.disabled).toBe(true);
  });

  it('closes with nothing on Cancel', () => {
    el.querySelector<HTMLButtonElement>('p-button[label="Cancel"] button')!.click();
    expect(ref.close).toHaveBeenCalledWith();
  });
});
