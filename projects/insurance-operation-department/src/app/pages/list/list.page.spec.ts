import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { of } from 'rxjs';
import { ToasterService } from '@samyak/shared-services';
import { ConfirmDialogComponent, DataTableComponent } from '@samyak/shared-ui';
import { InsurancePolicy, RECORDS } from '../../data/records';
import { RecordsStore } from '../../data/records.store';
import { UpdateStatusDialogComponent } from '../../dialogs/update-status-dialog/update-status-dialog.component';
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
  const clickAction = (action: string, row: InsurancePolicy) => table().actionClick.emit({ action, row });
  const findRow = (status: string) => store.all().find((r) => r.status === status)!;

  it('passes every policy to the shared table', () => {
    expect(table().data().length).toBe(RECORDS.length);
  });

  it('only offers "Mark lapsed" for policies that are due for renewal', () => {
    const markLapsed = table().actions().find((a) => a.key === 'markLapsed')!;
    expect(markLapsed.visible!(findRow('Renewal Due'))).toBe(true);
    expect(markLapsed.visible!(findRow('Active'))).toBe(false);
  });

  it('"view" navigates to the detail page relative to the current route', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const row = store.all()[0];

    clickAction('view', row);

    expect(navigate).toHaveBeenCalledWith([row.id], expect.objectContaining({ relativeTo: expect.anything() }));
  });

  it('"updateStatus" opens the module dialog and saves the new status', () => {
    const success = vi.spyOn(TestBed.inject(ToasterService), 'success');
    const row = findRow('Pending');
    dialogResult = { ...row, status: 'Active' };

    clickAction('updateStatus', row);

    expect(dialogs.open).toHaveBeenCalledWith(UpdateStatusDialogComponent, expect.objectContaining({ data: row }));
    expect(store.getById(row.id)?.status).toBe('Active');
    expect(success).toHaveBeenCalled();
  });

  it('"markLapsed" asks for confirmation, then marks the policy lapsed', () => {
    const warn = vi.spyOn(TestBed.inject(ToasterService), 'warn');
    const row = findRow('Renewal Due');
    dialogResult = true;

    clickAction('markLapsed', row);

    expect(dialogs.open).toHaveBeenCalledWith(ConfirmDialogComponent, expect.anything());
    expect(store.getById(row.id)?.status).toBe('Lapsed');
    expect(warn).toHaveBeenCalled();
  });

  it('"markLapsed" does nothing when the confirmation is declined', () => {
    const row = findRow('Renewal Due');
    dialogResult = false;

    clickAction('markLapsed', row);

    expect(store.getById(row.id)?.status).toBe('Renewal Due');
  });
});
