import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Complaint, OFFICERS, RECORDS } from '../../data/records';
import { AssignComplaintDialogComponent } from './assign-complaint-dialog.component';

describe('AssignComplaintDialogComponent', () => {
  let fixture: ComponentFixture<AssignComplaintDialogComponent>;
  let el: HTMLElement;
  const ref = { close: vi.fn() };

  async function open(complaint: Complaint) {
    ref.close.mockReset();
    await TestBed.configureTestingModule({
      imports: [AssignComplaintDialogComponent],
      providers: [
        { provide: DynamicDialogRef, useValue: ref },
        { provide: DynamicDialogConfig, useValue: { data: complaint } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AssignComplaintDialogComponent);
    fixture.detectChanges();
    el = fixture.nativeElement;
  }

  const form = () => fixture.componentInstance['form'];

  it('shows the ticket and keeps its current officer and priority', async () => {
    const complaint = RECORDS.find((c) => c.assignedTo)!;
    await open(complaint);

    expect(el.querySelector('.info')?.textContent).toContain(complaint.ticketNo);
    expect(form().getRawValue()).toEqual({ assignedTo: complaint.assignedTo, priority: complaint.priority });
  });

  it('suggests the first officer for an unassigned complaint', async () => {
    await open(RECORDS.find((c) => !c.assignedTo)!);
    expect(form().controls.assignedTo.value).toBe(OFFICERS[0]);
  });

  it('closes with the complaint and its new assignment on Assign', async () => {
    const complaint = RECORDS[0];
    await open(complaint);

    form().setValue({ assignedTo: 'Deepa Menon', priority: 'Low' });
    el.querySelector('form')!.dispatchEvent(new Event('submit'));

    expect(ref.close).toHaveBeenCalledWith({ ...complaint, assignedTo: 'Deepa Menon', priority: 'Low' });
  });

  it('closes with nothing on Cancel', async () => {
    await open(RECORDS[0]);
    el.querySelector<HTMLButtonElement>('p-button[label="Cancel"] button')!.click();
    expect(ref.close).toHaveBeenCalledWith();
  });
});
