import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ModuleTile } from '@samyak/shared-services';
import { ModuleTileComponent } from './module-tile.component';

describe('ModuleTileComponent', () => {
  const tile: ModuleTile = {
    key: 'brc',
    title: 'Bank Registration Cell',
    description: 'Register insured banks.',
    icon: 'pi pi-building-columns',
    route: '/brc',
    enabled: true,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModuleTileComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  function render(value: ModuleTile) {
    const fixture = TestBed.createComponent(ModuleTileComponent);
    fixture.componentRef.setInput('tile', value);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('links an enabled module to its route', () => {
    const el = render(tile);
    expect(el.querySelector('a.tile')?.getAttribute('href')).toBe('/brc');
    expect(el.querySelector('h3')?.textContent).toBe(tile.title);
    expect(el.querySelector('.cta')).not.toBeNull();
  });

  it('shows a disabled module as "Coming soon" without a link', () => {
    const el = render({ ...tile, enabled: false });
    expect(el.querySelector('a')).toBeNull();
    expect(el.querySelector('.tile.disabled .soon')?.textContent).toBe('Coming soon');
  });
});
