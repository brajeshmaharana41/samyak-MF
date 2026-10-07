import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { of } from 'rxjs';
import { ConfirmDialogComponent, DataTableComponent } from '@samyak/shared-ui';
import { Complaint, RECORDS } from '../../data/records';
import { RecordsStore } from '../../data/records.store';
import { AssignComplaintDialogComponent } from '../../dialogs/assign-complaint-dialog/assign-complaint-dialog.component';
import { ListPage } from './list.page';

describe('ListPage', () => {
  let fixture: ComponentFixture<ListPage>;
  let store: RecordsStore;
  /** What the (mocked) dialog closes with. */
  let dialogResult: unknown;
  const dialogs = { open: vi.fn() };

  beforeEach(async () => {
    dialogResult = undefined;
    dialogs.open.mockReset().mockImplementation(() => ({ onClose: of(dialogResult) }));

    await TestBed.configureTestingModule({
      imports: [ListPage],
      providers: [provideRouter([]), MessageService],
    })
      // The page provides DialogService itself, so swap it at component level.
      .overrideComponent(ListPage, { set: { providers: [{ provide: DialogService, useValue: dialogs }] } })
      .compileComponents();

    store = TestBed.inject(RecordsStore);
    fixture = TestBed.createComponent(ListPage);
    fixture.detectChanges();
  });

  const table = () => fixture.debugElement.query(By.directive(DataTableComponent)).componentInstance as DataTableComponent;
  const clickAction = (action: string, row: Complaint) => table().actionClick.emit({ action, row });
  const findRow = (state: string) => store.all().find((r) => r.state === state)!;

  it('passes every complaint to the shared table', () => {
    expect(table().data().length).toBe(RECORDS.length);
  });

  it('hides "Assign" and "Close ticket" for resolved complaints', () => {
    for (const key of ['assign', 'close']) {
      const action = table().actions().find((a) => a.key === key)!;
      expect(action.visible!(findRow('Open'))).toBe(true);
      expect(action.visible!(findRow('Resolved'))).toBe(false);
    }
  });

  it('"thread" navigates to the complaint detail page relative to the current route', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const row = store.all()[0];

    clickAction('thread', row);

    expect(navigate).toHaveBeenCalledWith([row.id], expect.objectContaining({ relativeTo: expect.anything() }));
  });

  it('"assign" opens the module dialog and saves the assignment', () => {
    const row = findRow('Open');
    dialogResult = { ...row, assignedTo: 'Kavita Joshi', priority: 'Critical' };

    clickAction('assign', row);

    expect(dialogs.open).toHaveBeenCalledWith(AssignComplaintDialogComponent, expect.objectContaining({ data: row }));
    expect(store.getById(row.id)).toMatchObject({ assignedTo: 'Kavita Joshi', priority: 'Critical' });
  });

  it('"close" asks for confirmation, then resolves the ticket', () => {
    const row = findRow('Open');
    dialogResult = true;

    clickAction('close', row);

    expect(dialogs.open).toHaveBeenCalledWith(ConfirmDialogComponent, expect.anything());
    expect(store.getById(row.id)?.state).toBe('Resolved');
  });

  it('"close" does nothing when the confirmation is declined', () => {
    const row = findRow('Open');
    dialogResult = false;

    clickAction('close', row);

    expect(store.getById(row.id)?.state).toBe('Open');
  });
});
