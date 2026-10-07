import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), MessageService],
    }).compileComponents();
  });

  it('hosts the single toast, the single loader and the router outlet', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelectorAll('p-toast').length).toBe(1);
    expect(el.querySelectorAll('samyak-loader').length).toBe(1);
    expect(el.querySelector('router-outlet')).not.toBeNull();
  });
});
