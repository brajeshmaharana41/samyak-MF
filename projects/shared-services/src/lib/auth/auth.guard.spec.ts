import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { authGuard, otpGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('authGuard', () => {
  let auth: AuthService;
  let router: Router;

  const run = (guard: typeof authGuard) =>
    TestBed.runInInjectionContext(() =>
      guard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    auth = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('redirects to /login when not logged in', () => {
    const result = run(authGuard) as UrlTree;
    expect(router.serializeUrl(result)).toBe('/login');
  });

  it('redirects to /otp when logged in but OTP not verified', () => {
    auth.login('admin', 'admin');
    const result = run(authGuard) as UrlTree;
    expect(router.serializeUrl(result)).toBe('/otp');
  });

  it('allows access after login and OTP', () => {
    auth.login('admin', 'admin');
    auth.verifyOtp('111111');
    expect(run(authGuard)).toBe(true);
  });

  it('blocks access again after logout', () => {
    auth.login('admin', 'admin');
    auth.verifyOtp('111111');
    auth.logout();
    const result = run(authGuard) as UrlTree;
    expect(router.serializeUrl(result)).toBe('/login');
  });

  it('otpGuard lets a logged-in (but not verified) user reach the OTP page', () => {
    auth.login('admin', 'admin');
    expect(run(otpGuard)).toBe(true);
  });
});
