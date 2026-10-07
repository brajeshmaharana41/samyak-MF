import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { of } from 'rxjs';
import { LoaderService } from '@samyak/shared-services';
import { ConfirmDialogComponent, DataTableComponent } from '@samyak/shared-ui';
import { RATE_BY_GRADE, RECORDS, RiskPremium, gradeFor } from '../../data/records';
import { RecordsStore } from '../../data/records.store';
import { OverrideGradeDialogComponent } from '../../dialogs/override-grade-dialog/override-grade-dialog.component';
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
  const clickAction = (action: string, row: RiskPremium) => table().actionClick.emit({ action, row });

  it('passes every bank rating to the shared table', () => {
    expect(table().data().length).toBe(RECORDS.length);
  });

  it('"breakdown" navigates to the detail page relative to the current route', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const row = store.all()[0];

    clickAction('breakdown', row);

    expect(navigate).toHaveBeenCalledWith([row.id], expect.objectContaining({ relativeTo: expect.anything() }));
  });

  it('"recalculate" asks for confirmation, then re-grades the bank from its score', async () => {
    // Start from a deliberately wrong grade so the recalculation is visible.
    const row = { ...store.all()[0], grade: 'D', premiumRate: RATE_BY_GRADE['D'] };
    store.update(row);
    dialogResult = true;

    clickAction('recalculate', row);

    expect(dialogs.open).toHaveBeenCalledWith(ConfirmDialogComponent, expect.anything());
    const grade = gradeFor(row.riskScore);
    await vi.waitFor(() => expect(store.getById(row.id)).toMatchObject({ grade, premiumRate: RATE_BY_GRADE[grade] }));
  });

  it('"recalculate" does nothing when the confirmation is declined', () => {
    const row = store.all()[0];
    dialogResult = false;

    clickAction('recalculate', row);

    expect(store.getById(row.id)).toEqual(row);
  });

  it('"override" opens the module dialog and saves the new grade', () => {
    const row = store.all()[0];
    dialogResult = { ...row, grade: 'C', premiumRate: RATE_BY_GRADE['C'] };

    clickAction('override', row);

    expect(dialogs.open).toHaveBeenCalledWith(OverrideGradeDialogComponent, expect.objectContaining({ data: row }));
    expect(store.getById(row.id)?.grade).toBe('C');
  });
});
