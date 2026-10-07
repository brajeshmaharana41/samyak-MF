import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '@samyak/shared-services';
import { MODULES } from '../../modules.config';
import { HomePage } from './home.page';

describe('HomePage', () => {
  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [provideRouter([]), MessageService],
    }).compileComponents();
    TestBed.inject(AuthService).login('admin', 'admin');
  });

  function render() {
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('welcomes the logged-in user', () => {
    expect(render().querySelector('h1')?.textContent).toContain('Admin User');
  });

  it('shows one tile per configured module', () => {
    expect(render().querySelectorAll('samyak-module-tile').length).toBe(MODULES.length);
  });

  it('logs out and goes back to the login page', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const el = render();

    el.querySelector<HTMLButtonElement>('p-button[label="Logout"] button')!.click();

    expect(TestBed.inject(AuthService).isLoggedIn()).toBe(false);
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });
});
