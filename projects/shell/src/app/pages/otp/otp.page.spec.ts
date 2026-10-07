import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService, LoaderService } from '@samyak/shared-services';
import { OtpPage } from './otp.page';

describe('OtpPage', () => {
  let fixture: ComponentFixture<OtpPage>;
  let el: HTMLElement;
  let auth: AuthService;
  let navigate: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [OtpPage],
      providers: [provideRouter([]), MessageService],
    }).compileComponents();

    auth = TestBed.inject(AuthService);
    auth.login('admin', 'admin');
    vi.spyOn(TestBed.inject(LoaderService), 'flash').mockResolvedValue();
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(OtpPage);
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  async function verify(otp: string) {
    fixture.componentInstance['otp'] = otp;
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('asks for all 6 digits', async () => {
    await verify('123');
    expect(el.querySelector('p-message')?.textContent).toContain('all 6 digits');
  });

  it('rejects a wrong OTP and clears the input', async () => {
    await verify('123456');
    expect(el.querySelector('p-message')?.textContent).toContain('Incorrect OTP');
    expect(fixture.componentInstance['otp']).toBe('');
    expect(auth.isOtpVerified()).toBe(false);
  });

  it('accepts the right OTP and goes home', async () => {
    await verify('111111');
    expect(auth.isOtpVerified()).toBe(true);
    expect(navigate).toHaveBeenCalledWith(['/home']);
  });

  it('"Back to login" ends the half-finished session', () => {
    [...el.querySelectorAll<HTMLButtonElement>('.links button')][0].click();
    expect(auth.isLoggedIn()).toBe(false);
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });
});
