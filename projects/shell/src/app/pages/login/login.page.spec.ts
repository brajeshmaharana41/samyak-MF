import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { AuthService, LoaderService } from '@samyak/shared-services';
import { LoginPage } from './login.page';

describe('LoginPage', () => {
  let fixture: ComponentFixture<LoginPage>;
  let el: HTMLElement;
  let navigate: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [provideRouter([])],
    }).compileComponents();

    vi.spyOn(TestBed.inject(LoaderService), 'flash').mockResolvedValue();
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  async function signIn(userId: string, password: string) {
    fixture.componentInstance['form'].setValue({ userId, password });
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('shows the demo credentials', () => {
    expect(el.querySelector('.hint')?.textContent).toContain('admin');
  });

  it('shows required-field errors when submitted empty', async () => {
    await signIn('', '');
    expect(el.querySelectorAll('.field-error').length).toBe(2);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('shows an error for wrong credentials', async () => {
    await signIn('admin', 'wrong');
    expect(el.querySelector('p-message')?.textContent).toContain('Invalid user ID or password');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('logs in and goes to the OTP step', async () => {
    await signIn('admin', 'admin');
    expect(TestBed.inject(AuthService).isLoggedIn()).toBe(true);
    expect(navigate).toHaveBeenCalledWith(['/otp']);
  });
});
