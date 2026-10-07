import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService, ToasterService } from '@samyak/shared-services';
import { ModuleTileComponent } from '@samyak/shared-ui';
import { MODULES } from '../../modules.config';

/** Landing page: one tile per business module, driven by modules.config.ts. */
@Component({
  selector: 'app-home-page',
  imports: [RouterLink, ButtonModule, ModuleTileComponent],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toaster = inject(ToasterService);

  protected readonly user = this.auth.currentUser;
  protected readonly modules = MODULES;

  protected logout(): void {
    this.auth.logout();
    this.toaster.info('You have been logged out.');
    this.router.navigate(['/login']);
  }
}
