import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputOtpModule } from 'primeng/inputotp';
import { MessageModule } from 'primeng/message';
import { AuthService, DEMO_CREDENTIALS, LoaderService, ToasterService } from '@samyak/shared-services';

/** Step 2 of login: 6-digit OTP. Success goes to /home. */
@Component({
  selector: 'app-otp-page',
  imports: [FormsModule, ButtonModule, InputOtpModule, MessageModule],
  templateUrl: './otp.page.html',
  styleUrl: './otp.page.scss',
})
export class OtpPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly loader = inject(LoaderService);
  private readonly toaster = inject(ToasterService);

  protected readonly demoOtp = DEMO_CREDENTIALS.otp;
  protected otp = '';
  protected readonly error = signal<string | null>(null);

  protected async verify(): Promise<void> {
    this.error.set(null);
    if (!/^\d{6}$/.test(this.otp ?? '')) {
      this.error.set('Please enter all 6 digits.');
      return;
    }
    await this.loader.flash(400);
    if (this.auth.verifyOtp(this.otp)) {
      this.toaster.success(`Welcome, ${this.auth.currentUser()?.name}`);
      this.router.navigate(['/home']);
    } else {
      this.error.set('Incorrect OTP. Please try again.');
      this.otp = '';
    }
  }

  protected resend(): void {
    this.auth.resendOtp();
    this.toaster.info('A new OTP has been sent (demo: it is still 111111).');
  }

  protected backToLogin(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
