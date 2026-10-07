import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { of } from 'rxjs';
import { LoaderService, ToasterService } from '@samyak/shared-services';
import { ConfirmDialogComponent, DataTableComponent } from '@samyak/shared-ui';
import { BankRegistration, RECORDS } from '../../data/records';
import { RecordsStore } from '../../data/records.store';
import { EditRegistrationDialogComponent } from '../../dialogs/edit-registration-dialog/edit-registration-dialog.component';
import { PreviewCertificateDialogComponent } from '../../certificate/preview-certificate-dialog/preview-certificate-dialog.component';
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

    vi.spyOn(TestBed.inject(LoaderService), 'flash').mockResolvedValue();
    store = TestBed.inject(RecordsStore);
    fixture = TestBed.createComponent(ListPage);
    fixture.detectChanges();
  });

  const table = () => fixture.debugElement.query(By.directive(DataTableComponent)).componentInstance as DataTableComponent;
  const clickAction = (action: string, row: BankRegistration) => table().actionClick.emit({ action, row });
  const findRow = (status: string) => store.all().find((r) => r.status === status)!;

  it('passes every record to the shared table', () => {
    expect(table().data().length).toBe(RECORDS.length);
  });

  it('only offers "Approve" for undecided applications and "Certificate" for approved ones', () => {
    const approve = table().actions().find((a) => a.key === 'approve')!;
    const certificate = table().actions().find((a) => a.key === 'certificate')!;

    expect(approve.visible!(findRow('Pending'))).toBe(true);
    expect(approve.visible!(findRow('Approved'))).toBe(false);
    expect(certificate.visible!(findRow('Approved'))).toBe(true);
    expect(certificate.visible!(findRow('Pending'))).toBe(false);
  });

  it('"view" navigates to the detail page relative to the current route', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const row = store.all()[0];

    clickAction('view', row);

    expect(navigate).toHaveBeenCalledWith([row.id], expect.objectContaining({ relativeTo: expect.anything() }));
  });

  it('"edit" opens the module dialog and saves what it returns', async () => {
    const success = vi.spyOn(TestBed.inject(ToasterService), 'success');
    const row = store.all()[0];
    dialogResult = { ...row, bankName: 'Renamed Bank' };

    clickAction('edit', row);

    expect(dialogs.open).toHaveBeenCalledWith(EditRegistrationDialogComponent, expect.objectContaining({ data: row }));
    await vi.waitFor(() => expect(store.getById(row.id)?.bankName).toBe('Renamed Bank'));
    expect(success).toHaveBeenCalled();
  });

  it('"edit" changes nothing when the dialog is cancelled', () => {
    const row = store.all()[0];
    clickAction('edit', row);
    expect(store.getById(row.id)).toEqual(row);
  });

  it('"approve" asks for confirmation, then approves', () => {
    const row = findRow('Pending');
    dialogResult = true;

    clickAction('approve', row);

    expect(dialogs.open).toHaveBeenCalledWith(ConfirmDialogComponent, expect.anything());
    expect(store.getById(row.id)?.status).toBe('Approved');
  });

  it('"approve" does nothing when the confirmation is declined', () => {
    const row = findRow('Pending');
    dialogResult = false;

    clickAction('approve', row);

    expect(store.getById(row.id)?.status).toBe('Pending');
  });

  it('"certificate" opens the PDF preview dialog', () => {
    const row = findRow('Approved');
    clickAction('certificate', row);
    expect(dialogs.open).toHaveBeenCalledWith(PreviewCertificateDialogComponent, expect.objectContaining({ data: row }));
  });
});
