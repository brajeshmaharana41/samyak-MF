import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { USERS } from '../user.model';
import { UserDetailPage } from './user-detail.page';

describe('UserDetailPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDetailPage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  function render(id: string) {
    const fixture = TestBed.createComponent(UserDetailPage);
    fixture.componentRef.setInput('id', id);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows the user that matches the :id', () => {
    const user = USERS[0];
    const el = render(user.id);

    expect(el.querySelector('h1')?.textContent).toBe(user.name);
    expect(el.querySelector('dl')?.textContent).toContain(user.department);
  });

  it('shows a "not found" message for an unknown id', () => {
    const el = render('U999');
    expect(el.querySelector('h1')?.textContent).toBe('User not found');
    expect(el.textContent).toContain('No user with id "U999"');
  });
});
