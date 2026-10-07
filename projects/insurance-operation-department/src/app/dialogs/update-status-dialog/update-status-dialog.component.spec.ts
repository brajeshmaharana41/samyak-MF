import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { RECORDS } from '../../data/records';
import { UpdateStatusDialogComponent } from './update-status-dialog.component';

describe('UpdateStatusDialogComponent', () => {
  const policy = RECORDS[0];
  let fixture: ComponentFixture<UpdateStatusDialogComponent>;
  let el: HTMLElement;
  const ref = { close: vi.fn() };

  beforeEach(async () => {
    ref.close.mockReset();
    await TestBed.configureTestingModule({
      imports: [UpdateStatusDialogComponent],
      providers: [
        { provide: DynamicDialogRef, useValue: ref },
        { provide: DynamicDialogConfig, useValue: { data: policy } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateStatusDialogComponent);
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  const form = () => fixture.componentInstance['form'];

  it('shows which policy is being changed and starts at its current status', () => {
    expect(el.querySelector('.info')?.textContent).toContain(policy.policyNo);
    expect(form().controls.status.value).toBe(policy.status);
  });

  it('closes with the policy and its new status on Update', () => {
    form().controls.status.setValue('Lapsed');
    el.querySelector('form')!.dispatchEvent(new Event('submit'));

    expect(ref.close).toHaveBeenCalledWith({ ...policy, status: 'Lapsed' });
  });

  it('disables Update when no status is chosen', () => {
    form().controls.status.setValue('');
    fixture.detectChanges();
    expect(el.querySelector<HTMLButtonElement>('p-button[type="submit"] button')?.disabled).toBe(true);
  });

  it('closes with nothing on Cancel', () => {
    el.querySelector<HTMLButtonElement>('p-button[label="Cancel"] button')!.click();
    expect(ref.close).toHaveBeenCalledWith();
  });
});
