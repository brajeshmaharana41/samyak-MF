import { ModuleTile } from '@samyak/shared-services';

/**
 * THE list of business modules shown as tiles on the landing page.
 *
 * Adding a module = one entry here + one line in public/federation.manifest.json
 * (scripts/add-remote.mjs does both for you). The shell routes for the modules
 * are generated from this same list in app.routes.ts.
 *
 * `key` must match the manifest key. `enabled: false` shows a "Coming soon" tile.
 */
export const MODULES: ModuleTile[] = [
  {
    key: 'brc',
    title: 'Bank Registration Cell',
    description: 'Register insured banks, review applications and approve registrations.',
    icon: 'pi pi-building-columns',
    route: '/brc',
    enabled: true,
  },
  {
    key: 'iod',
    title: 'Insurance Operation Department',
    description: 'Track deposit insurance policies, premiums and policy periods.',
    icon: 'pi pi-shield',
    route: '/iod',
    enabled: true,
  },
  {
    key: 'csd',
    title: 'Claim Settlement Department',
    description: 'Process depositor claims and approve payouts.',
    icon: 'pi pi-wallet',
    route: '/csd',
    enabled: true,
  },
  {
    key: 'crc',
    title: 'Complaint Redressal Cell',
    description: 'Log, assign and resolve complaints from depositors and banks.',
    icon: 'pi pi-comments',
    route: '/crc',
    enabled: true,
  },
  {
    key: 'rmc',
    title: 'Recovery Management Cell',
    description: 'Follow up on outstanding dues and record recoveries.',
    icon: 'pi pi-replay',
    route: '/rmc',
    enabled: true,
  },
  {
    key: 'rbp',
    title: 'Risk Based Premium',
    description: 'Risk scores, grades and premium rates for insured banks.',
    icon: 'pi pi-chart-line',
    route: '/rbp',
    enabled: true,
  },
];
