import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { USERS } from '../user.model';
import { UserEditDialogComponent } from './user-edit-dialog.component';

describe('UserEditDialogComponent', () => {
  const user = USERS[0];
  let fixture: ComponentFixture<UserEditDialogComponent>;
  let el: HTMLElement;
  const ref = { close: vi.fn() };

  beforeEach(async () => {
    ref.close.mockReset();
    await TestBed.configureTestingModule({
      imports: [UserEditDialogComponent],
      providers: [
        { provide: DynamicDialogRef, useValue: ref },
        { provide: DynamicDialogConfig, useValue: { data: { user } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserEditDialogComponent);
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  const type = (selector: string, value: string) => {
    const input = el.querySelector<HTMLInputElement>(selector)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  };

  it('is pre-filled with the user', () => {
    expect(el.querySelector<HTMLInputElement>('#name')?.value).toBe(user.name);
    expect(el.querySelector<HTMLInputElement>('#department')?.value).toBe(user.department);
  });

  it('closes with the edited user on save', () => {
    type('#department', 'Audit');
    el.querySelector('form')!.dispatchEvent(new Event('submit'));

    expect(ref.close).toHaveBeenCalledWith({ ...user, department: 'Audit' });
  });

  it('disables Save while a required field is empty', () => {
    type('#name', '');
    expect(el.querySelector<HTMLButtonElement>('p-button[type="submit"] button')?.disabled).toBe(true);
  });

  it('closes with nothing on Cancel', () => {
    el.querySelector<HTMLButtonElement>('p-button[label="Cancel"] button')!.click();
    expect(ref.close).toHaveBeenCalledWith();
  });
});
