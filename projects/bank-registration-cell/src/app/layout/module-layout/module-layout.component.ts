import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@samyak/shared-services';
import { MODULE_INFO } from '../../data/records';

/**
 * Frame around every page of this module: title, current user, "Back to home", tabs.
 *
 * The user name comes from the SHARED AuthService. This remote never logs in;
 * it gets the same AuthService instance the shell used, because
 * @samyak/shared-services is shared as a singleton by Native Federation.
 */
@Component({
  selector: 'brc-module-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './module-layout.component.html',
  styleUrl: './module-layout.component.scss',
})
export class ModuleLayoutComponent {
  protected readonly auth = inject(AuthService);
  protected readonly info = MODULE_INFO;
}
