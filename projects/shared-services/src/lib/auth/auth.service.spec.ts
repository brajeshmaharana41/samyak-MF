import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let auth: AuthService;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({});
    auth = TestBed.inject(AuthService);
  });

  it('starts logged out', () => {
    expect(auth.isLoggedIn()).toBe(false);
    expect(auth.isOtpVerified()).toBe(false);
    expect(auth.currentUser()).toBeNull();
  });

  it('logs in with admin / admin', () => {
    expect(auth.login('admin', 'admin')).toBe(true);
    expect(auth.isLoggedIn()).toBe(true);
    expect(auth.isOtpVerified()).toBe(false);
    expect(auth.currentUser()?.userId).toBe('admin');
  });

  it('rejects wrong credentials', () => {
    expect(auth.login('admin', 'wrong')).toBe(false);
    expect(auth.login('someone', 'admin')).toBe(false);
    expect(auth.isLoggedIn()).toBe(false);
  });

  it('accepts OTP 111111 after login', () => {
    auth.login('admin', 'admin');
    expect(auth.verifyOtp('111111')).toBe(true);
    expect(auth.isOtpVerified()).toBe(true);
  });

  it('rejects a wrong OTP', () => {
    auth.login('admin', 'admin');
    expect(auth.verifyOtp('123456')).toBe(false);
    expect(auth.isOtpVerified()).toBe(false);
  });

  it('rejects the OTP when not logged in', () => {
    expect(auth.verifyOtp('111111')).toBe(false);
  });

  it('stores the session in sessionStorage and clears it on logout', () => {
    auth.login('admin', 'admin');
    expect(sessionStorage.getItem('samyak.session')).not.toBeNull();
    auth.logout();
    expect(sessionStorage.getItem('samyak.session')).toBeNull();
    expect(auth.isLoggedIn()).toBe(false);
  });
});
