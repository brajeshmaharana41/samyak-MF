import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { RATE_BY_GRADE, RECORDS } from '../../data/records';
import { OverrideGradeDialogComponent } from './override-grade-dialog.component';

describe('OverrideGradeDialogComponent', () => {
  const rating = RECORDS[0];
  let fixture: ComponentFixture<OverrideGradeDialogComponent>;
  let el: HTMLElement;
  const ref = { close: vi.fn() };

  beforeEach(async () => {
    ref.close.mockReset();
    await TestBed.configureTestingModule({
      imports: [OverrideGradeDialogComponent],
      providers: [
        { provide: DynamicDialogRef, useValue: ref },
        { provide: DynamicDialogConfig, useValue: { data: rating } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OverrideGradeDialogComponent);
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  const form = () => fixture.componentInstance['form'];

  it('shows the bank and the premium rate for the chosen grade', () => {
    expect(el.querySelector('.info')?.textContent).toContain(rating.bankName);

    form().controls.grade.setValue('D');
    fixture.detectChanges();
    expect(el.querySelector('small')?.textContent).toContain(`${RATE_BY_GRADE['D']} paise`);
  });

  it('closes with the new grade and its premium rate on Override', () => {
    form().controls.grade.setValue('C');
    el.querySelector('form')!.dispatchEvent(new Event('submit'));

    expect(ref.close).toHaveBeenCalledWith({ ...rating, grade: 'C', premiumRate: RATE_BY_GRADE['C'] });
  });

  it('requires a justification', () => {
    form().controls.reason.setValue('');
    fixture.detectChanges();
    expect(el.querySelector<HTMLButtonElement>('p-button[type="submit"] button')?.disabled).toBe(true);
  });

  it('closes with nothing on Cancel', () => {
    el.querySelector<HTMLButtonElement>('p-button[label="Cancel"] button')!.click();
    expect(ref.close).toHaveBeenCalledWith();
  });
});
