import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { AuthService, DEMO_CREDENTIALS, LoaderService } from '@samyak/shared-services';

/** Step 1 of login: user id + password. Success goes to /otp. */
@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, PasswordModule, MessageModule],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly loader = inject(LoaderService);

  protected readonly demo = DEMO_CREDENTIALS;
  protected readonly error = signal<string | null>(null);

  protected readonly form = new FormGroup({
    userId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  protected async submit(): Promise<void> {
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    await this.loader.flash(400);
    const { userId, password } = this.form.getRawValue();
    if (this.auth.login(userId, password)) {
      this.router.navigate(['/otp']);
    } else {
      this.error.set('Invalid user ID or password. Please try again.');
    }
  }

  protected showError(control: 'userId' | 'password'): boolean {
    const c = this.form.controls[control];
    return c.invalid && c.touched;
  }
}
