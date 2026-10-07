import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '@samyak/shared-services';
import { MODULE_INFO } from '../../data/records';
import { ModuleLayoutComponent } from './module-layout.component';

describe('ModuleLayoutComponent', () => {
  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [ModuleLayoutComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  function render() {
    const fixture = TestBed.createComponent(ModuleLayoutComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows the module title and the tabs', () => {
    const el = render();
    expect(el.querySelector('.title strong')?.textContent).toBe(MODULE_INFO.title);
    expect(el.querySelector('.tabs')?.textContent).toContain(MODULE_INFO.listTitle);
    expect(el.querySelector('router-outlet')).not.toBeNull();
  });

  it('shows the user from the shared AuthService', () => {
    TestBed.inject(AuthService).login('admin', 'admin');
    expect(render().querySelector('.user')?.textContent).toContain('Admin User');
  });

  it('falls back to "Unknown user" when nobody is logged in', () => {
    expect(render().querySelector('.user')?.textContent).toContain('Unknown user');
  });
});
