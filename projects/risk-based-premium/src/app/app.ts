import { Component } from '@angular/core';

/**
 * Root component used only when someone opens this remote's port directly.
 * Remotes are meant to run INSIDE the shell (which owns login and the session),
 * so here we just point the user to the shell.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
