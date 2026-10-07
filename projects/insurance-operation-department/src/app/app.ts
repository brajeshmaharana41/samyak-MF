import { Component } from '@angular/core';

/**
 * Root component used only when someone opens this remote's port directly.
 * Remotes are meant to run INSIDE the shell (which owns login and the session),
 * so here we just point the user to the shell.
 */
@Component({
  selector: 'app-root',
  template: `
    <main style="font-family: Segoe UI, Roboto, sans-serif; max-width: 560px; margin: 15vh auto; padding: 2rem; text-align: center; background: #fff; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,.08)">
      <h1 style="margin-top: 0">Insurance Operation Department</h1>
      <p>This is a micro-frontend module. It runs inside the Samyak shell, which handles login.</p>
      <p>Open this module from the shell at <a href="http://localhost:4200">http://localhost:4200</a></p>
    </main>
  `,
})
export class App {}
