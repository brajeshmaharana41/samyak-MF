import { Component, inject } from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LoaderService } from '@samyak/shared-services';

/**
 * Full-screen loading overlay. Placed ONCE in the shell's root template.
 * Any page in the shell or in a remote calls LoaderService.show()/hide() to drive it.
 */
@Component({
  selector: 'samyak-loader',
  imports: [ProgressSpinnerModule],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss',
})
export class LoaderComponent {
  protected readonly loader = inject(LoaderService);
}
