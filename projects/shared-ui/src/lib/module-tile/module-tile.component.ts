import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';
import { ModuleTile } from '@samyak/shared-services';

/** One card on the landing page. Clicking it opens the module (a remote) inside the shell. */
@Component({
  selector: 'samyak-module-tile',
  imports: [RouterLink, NgTemplateOutlet],
  templateUrl: './module-tile.component.html',
  styleUrl: './module-tile.component.scss',
})
export class ModuleTileComponent {
  readonly tile = input.required<ModuleTile>();
}
