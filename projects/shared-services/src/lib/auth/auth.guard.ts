import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Protects every page behind login (home, users, and every remote module).
 *  - not logged in        -> /login
 *  - logged in, no OTP    -> /otp
 *  - both steps done      -> allowed
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }
  if (!auth.isOtpVerified()) {
    return router.createUrlTree(['/otp']);
  }
  return true;
};

/** The OTP page needs step 1 (login) but not step 2. */
export const otpGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }
  if (auth.isOtpVerified()) {
    return router.createUrlTree(['/home']);
  }
  return true;
};

/** The login page: if the user is already fully authenticated, go straight home. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isOtpVerified() ? router.createUrlTree(['/home']) : true;
};
