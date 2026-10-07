import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { of } from 'rxjs';
import { ConfirmDialogComponent, DataTableComponent } from '@samyak/shared-ui';
import { ModuleRecord, RECORDS } from '../../data/records';
import { RecordsStore } from '../../data/records.store';
import { EditRecordDialogComponent } from '../../dialogs/edit-record-dialog/edit-record-dialog.component';
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
  const clickAction = (action: string, row: ModuleRecord) => table().actionClick.emit({ action, row });
  const openRow = () => store.all().find((r) => r.status !== 'Closed')!;

  it('passes every record to the shared table', () => {
    expect(table().data().length).toBe(RECORDS.length);
  });

  it('hides "Close" for records that are already closed', () => {
    const close = table().actions().find((a) => a.key === 'close')!;
    expect(close.visible!(openRow())).toBe(true);
    expect(close.visible!({ ...openRow(), status: 'Closed' })).toBe(false);
  });

  it('"view" navigates to the detail page relative to the current route', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const row = store.all()[0];

    clickAction('view', row);

    expect(navigate).toHaveBeenCalledWith([row.id], expect.objectContaining({ relativeTo: expect.anything() }));
  });

  it('"edit" opens the module dialog and saves what it returns', () => {
    const row = store.all()[0];
    dialogResult = { ...row, name: 'Renamed' };

    clickAction('edit', row);

    expect(dialogs.open).toHaveBeenCalledWith(EditRecordDialogComponent, expect.objectContaining({ data: row }));
    expect(store.getById(row.id)?.name).toBe('Renamed');
  });

  it('"close" asks for confirmation, then closes the record', () => {
    const row = openRow();
    dialogResult = true;

    clickAction('close', row);

    expect(dialogs.open).toHaveBeenCalledWith(ConfirmDialogComponent, expect.anything());
    expect(store.getById(row.id)?.status).toBe('Closed');
  });

  it('"close" does nothing when the confirmation is declined', () => {
    const row = openRow();
    dialogResult = false;

    clickAction('close', row);

    expect(store.getById(row.id)?.status).toBe(row.status);
  });
});
