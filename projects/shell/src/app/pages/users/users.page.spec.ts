import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { of } from 'rxjs';
import { ConfirmDialogComponent, DataTableComponent } from '@samyak/shared-ui';
import { USERS, User } from './user.model';
import { UserEditDialogComponent } from './user-edit-dialog/user-edit-dialog.component';
import { UsersPage } from './users.page';

describe('UsersPage', () => {
  let fixture: ComponentFixture<UsersPage>;
  /** What the (mocked) dialog closes with. */
  let dialogResult: unknown;
  const dialogs = { open: vi.fn() };

  beforeEach(async () => {
    dialogResult = undefined;
    dialogs.open.mockReset().mockImplementation(() => ({ onClose: of(dialogResult) }));

    await TestBed.configureTestingModule({
      imports: [UsersPage],
      providers: [provideRouter([]), MessageService],
    })
      // The page provides DialogService itself, so swap it at component level.
      .overrideComponent(UsersPage, { set: { providers: [{ provide: DialogService, useValue: dialogs }] } })
      .compileComponents();

    fixture = TestBed.createComponent(UsersPage);
    fixture.detectChanges();
  });

  const table = () => fixture.debugElement.query(By.directive(DataTableComponent)).componentInstance as DataTableComponent;
  const clickAction = (action: string, row: User) => table().actionClick.emit({ action, row });
  const userById = (id: string) => (table().data() as User[]).find((u) => u.id === id);
  const activeUser = USERS.find((u) => u.status === 'Active')!;

  it('passes every user to the shared table', () => {
    expect(table().data().length).toBe(USERS.length);
  });

  it('hides "Disable" for users that are already disabled', () => {
    const disable = table().actions().find((a) => a.key === 'disable')!;
    expect(disable.visible!(activeUser)).toBe(true);
    expect(disable.visible!({ ...activeUser, status: 'Disabled' })).toBe(false);
  });

  it('"view" navigates to the user detail page', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    clickAction('view', activeUser);
    expect(navigate).toHaveBeenCalledWith([activeUser.id], expect.objectContaining({ relativeTo: expect.anything() }));
  });

  it('"edit" opens the user dialog and shows the saved changes', () => {
    dialogResult = { ...activeUser, name: 'Renamed User' };

    clickAction('edit', activeUser);
    fixture.detectChanges();

    expect(dialogs.open).toHaveBeenCalledWith(UserEditDialogComponent, expect.objectContaining({ data: { user: activeUser } }));
    expect(userById(activeUser.id)?.name).toBe('Renamed User');
  });

  it('"disable" asks for confirmation, then disables the user', () => {
    dialogResult = true;

    clickAction('disable', activeUser);
    fixture.detectChanges();

    expect(dialogs.open).toHaveBeenCalledWith(ConfirmDialogComponent, expect.anything());
    expect(userById(activeUser.id)?.status).toBe('Disabled');
  });

  it('"disable" does nothing when the confirmation is declined', () => {
    dialogResult = false;
    clickAction('disable', activeUser);
    expect(userById(activeUser.id)?.status).toBe('Active');
  });
});
