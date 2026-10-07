import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PageHeaderComponent } from './page-header.component';

@Component({
  imports: [PageHeaderComponent],
  template: `<samyak-page-header title="Users" subtitle="All users" backLink="/home"><button>Extra</button></samyak-page-header>`,
})
class HostComponent {}

describe('PageHeaderComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageHeaderComponent, HostComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('shows the title, subtitle, back button and projected content', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('h1')?.textContent).toBe('Users');
    expect(el.querySelector('p')?.textContent).toBe('All users');
    expect(el.querySelector('p-button')).not.toBeNull();
    expect(el.querySelector('.right button')?.textContent).toBe('Extra');
  });

  it('leaves out the back button and subtitle when they are not set', () => {
    const fixture = TestBed.createComponent(PageHeaderComponent);
    fixture.componentRef.setInput('title', 'Dashboard');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('h1')?.textContent).toBe('Dashboard');
    expect(el.querySelector('p')).toBeNull();
    expect(el.querySelector('p-button')).toBeNull();
  });
});
