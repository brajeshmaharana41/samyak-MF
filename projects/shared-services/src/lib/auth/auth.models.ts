/** The logged-in user, as returned by the (mock) login. */
export interface AuthUser {
  userId: string;
  name: string;
  role: string;
}

/** What we keep in sessionStorage between page reloads. */
export interface AuthSession {
  user: AuthUser;
  token: string;
  otpVerified: boolean;
}

/** Demo credentials. Shown on the login and OTP screens so nobody gets stuck in a demo. */
export const DEMO_CREDENTIALS = {
  userId: 'admin',
  password: 'admin',
  otp: '111111',
} as const;
