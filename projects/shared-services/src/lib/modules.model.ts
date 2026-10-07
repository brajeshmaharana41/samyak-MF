/** One tile on the landing page = one business module (a remote). */
export interface ModuleTile {
  /** Short key; same as the key in federation.manifest.json (e.g. "brc"). */
  key: string;
  title: string;
  description: string;
  /** PrimeIcons class, e.g. "pi pi-building-columns". */
  icon: string;
  /** Shell route that loads the module, e.g. "/brc". */
  route: string;
  /** false = remote not built yet; the tile shows "Coming soon". */
  enabled: boolean;
}
