import { Injectable, computed, signal } from '@angular/core';
import { AuthSession, AuthUser, DEMO_CREDENTIALS } from './auth.models';

const STORAGE_KEY = 'samyak.session';

/**
 * MOCK authentication service.
 *
 * `providedIn: 'root'` + Native Federation sharing @samyak/shared-services as a
 * singleton = exactly ONE instance for the shell and every remote. When a remote
 * page injects AuthService it gets the same object the shell logged in with,
 * which is how remotes know the current user without implementing login.
 *
 * Login is a two-step flow: login() (user id + password), then verifyOtp().
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly session = signal<AuthSession | null>(this.readSession());

  /** Step 1 done: user id and password were correct. */
  readonly isLoggedIn = computed(() => this.session() !== null);
  /** Step 2 done: the OTP was correct too. Only now is the user fully authenticated. */
  readonly isOtpVerified = computed(() => this.session()?.otpVerified === true);
  readonly currentUser = computed<AuthUser | null>(() => this.session()?.user ?? null);
  readonly token = computed(() => this.session()?.token ?? null);

  /** Mock login: only admin / admin succeeds. Returns true on success. */
  login(userId: string, password: string): boolean {
    const ok = userId.trim() === DEMO_CREDENTIALS.userId && password === DEMO_CREDENTIALS.password;
    if (!ok) {
      return false;
    }
    this.save({
      user: { userId: 'admin', name: 'Admin User', role: 'Administrator' },
      token: 'mock-token-' + Date.now(),
      otpVerified: false,
    });
    return true;
  }

  /** Mock OTP check: only 111111 succeeds, and only after a successful login. */
  verifyOtp(otp: string): boolean {
    const current = this.session();
    if (!current || otp !== DEMO_CREDENTIALS.otp) {
      return false;
    }
    this.save({ ...current, otpVerified: true });
    return true;
  }

  /** Mock "resend OTP". A real system would call the backend here. */
  resendOtp(): void {
    // Nothing to do in the mock.
  }

  logout(): void {
    sessionStorage.removeItem(STORAGE_KEY);
    this.session.set(null);
  }

  private save(session: AuthSession): void {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    this.session.set(session);
  }

  private readSession(): AuthSession | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthSession) : null;
    } catch {
      return null;
    }
  }
}
