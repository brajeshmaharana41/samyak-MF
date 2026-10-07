import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { of } from 'rxjs';
import { ToasterService } from '@samyak/shared-services';
import { ConfirmDialogComponent, DataTableComponent } from '@samyak/shared-ui';
import { RECORDS, RecoveryCase } from '../../data/records';
import { RecordsStore } from '../../data/records.store';
import { RecordPaymentDialogComponent } from '../../dialogs/record-payment-dialog/record-payment-dialog.component';
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
  const clickAction = (action: string, row: RecoveryCase) => table().actionClick.emit({ action, row });
  const findRow = (status: string) => store.all().find((r) => r.status === status)!;

  it('passes every case to the shared table', () => {
    expect(table().data().length).toBe(RECORDS.length);
  });

  it('only offers payments and write-offs while money is outstanding', () => {
    for (const key of ['recordPayment', 'writeOff']) {
      const action = table().actions().find((a) => a.key === key)!;
      expect(action.visible!(findRow('Open'))).toBe(true);
      expect(action.visible!(findRow('Fully Recovered'))).toBe(false);
      expect(action.visible!(findRow('Written Off'))).toBe(false);
    }
  });

  it('"view" navigates to the case detail page relative to the current route', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const row = store.all()[0];

    clickAction('view', row);

    expect(navigate).toHaveBeenCalledWith([row.id], expect.objectContaining({ relativeTo: expect.anything() }));
  });

  it('"recordPayment" opens the module dialog and saves the payment', () => {
    const success = vi.spyOn(TestBed.inject(ToasterService), 'success');
    const row = findRow('Open');
    dialogResult = { ...row, outstanding: row.outstanding - 1000, recovered: row.recovered + 1000, status: 'Partially Recovered' };

    clickAction('recordPayment', row);

    expect(dialogs.open).toHaveBeenCalledWith(RecordPaymentDialogComponent, expect.objectContaining({ data: row }));
    expect(store.getById(row.id)?.recovered).toBe(row.recovered + 1000);
    expect(success).toHaveBeenCalledWith(expect.stringContaining('1,000'));
  });

  it('"writeOff" asks for confirmation, then writes the case off', () => {
    const row = findRow('Open');
    dialogResult = true;

    clickAction('writeOff', row);

    expect(dialogs.open).toHaveBeenCalledWith(ConfirmDialogComponent, expect.anything());
    expect(store.getById(row.id)?.status).toBe('Written Off');
  });

  it('"writeOff" does nothing when the confirmation is declined', () => {
    const row = findRow('Open');
    dialogResult = false;

    clickAction('writeOff', row);

    expect(store.getById(row.id)?.status).toBe('Open');
  });
});
