import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { of } from 'rxjs';
import { ToasterService } from '@samyak/shared-services';
import { ConfirmDialogComponent, DataTableComponent } from '@samyak/shared-ui';
import { DepositorClaim, RECORDS } from '../../data/records';
import { RecordsStore } from '../../data/records.store';
import { RequestDocumentsDialogComponent } from '../../dialogs/request-documents-dialog/request-documents-dialog.component';
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
  const clickAction = (action: string, row: DepositorClaim) => table().actionClick.emit({ action, row });
  const findRow = (stage: string) => store.all().find((r) => r.stage === stage)!;

  it('passes every claim to the shared table', () => {
    expect(table().data().length).toBe(RECORDS.length);
  });

  it('only offers "Approve payout" for approved claims and no document requests once paid', () => {
    const payout = table().actions().find((a) => a.key === 'approvePayout')!;
    const docs = table().actions().find((a) => a.key === 'requestDocs')!;

    expect(payout.visible!(findRow('Approved'))).toBe(true);
    expect(payout.visible!(findRow('Verification'))).toBe(false);
    expect(docs.visible!(findRow('Paid'))).toBe(false);
    expect(docs.visible!(findRow('Verification'))).toBe(true);
  });

  it('"open" navigates to the claim detail page relative to the current route', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const row = store.all()[0];

    clickAction('open', row);

    expect(navigate).toHaveBeenCalledWith([row.id], expect.objectContaining({ relativeTo: expect.anything() }));
  });

  it('"requestDocs" opens the module dialog and confirms what was requested', () => {
    const info = vi.spyOn(TestBed.inject(ToasterService), 'info');
    const row = findRow('Verification');
    dialogResult = ['Passbook copy', 'Cancelled cheque'];

    clickAction('requestDocs', row);

    expect(dialogs.open).toHaveBeenCalledWith(RequestDocumentsDialogComponent, expect.objectContaining({ data: row }));
    expect(info).toHaveBeenCalledWith(expect.stringContaining('2 document(s)'));
  });

  it('"approvePayout" asks for confirmation, then marks the claim paid', () => {
    const row = findRow('Approved');
    dialogResult = true;

    clickAction('approvePayout', row);

    expect(dialogs.open).toHaveBeenCalledWith(ConfirmDialogComponent, expect.anything());
    expect(store.getById(row.id)?.stage).toBe('Paid');
  });

  it('"approvePayout" does nothing when the confirmation is declined', () => {
    const row = findRow('Approved');
    dialogResult = false;

    clickAction('approvePayout', row);

    expect(store.getById(row.id)?.stage).toBe('Approved');
  });
});
