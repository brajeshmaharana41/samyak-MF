import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App (standalone notice)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [App] }).compileComponents();
  });

  it('names the module and points the user to the shell', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('h1')?.textContent).toContain('__TITLE__');
    expect(el.querySelector('a')?.getAttribute('href')).toBe('http://localhost:4200');
  });
});
