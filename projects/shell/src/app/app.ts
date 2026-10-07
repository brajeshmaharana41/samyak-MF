import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { LoaderComponent } from '@samyak/shared-ui';

/**
 * Root component of the whole application.
 * It hosts ONE toast and ONE loader overlay; pages in the shell and in every
 * remote drive them through ToasterService / LoaderService (shared singletons).
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule, LoaderComponent],
  templateUrl: './app.html',
})
export class App {}
