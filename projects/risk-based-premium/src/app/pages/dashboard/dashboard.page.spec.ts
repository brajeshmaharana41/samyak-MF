import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MODULE_INFO, RECORDS } from '../../data/records';
import { RecordsStore } from '../../data/records.store';
import { DashboardPage } from './dashboard.page';

describe('DashboardPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  function render() {
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    return fixture;
  }

  it('shows the total number of records', () => {
    const el: HTMLElement = render().nativeElement;
    expect(el.querySelector('.stat.total .value')?.textContent?.trim()).toBe(String(RECORDS.length));
  });

  it('shows one card per status, with its count', () => {
    const el: HTMLElement = render().nativeElement;
    const statuses = RECORDS.map((r) => r[MODULE_INFO.statusField]);
    const cards = el.querySelectorAll('.stat:not(.total)');

    expect(cards.length).toBe(new Set(statuses).size);
    const counts = [...cards].map((c) => Number(c.querySelector('.value')?.textContent));
    expect(counts.reduce((a, b) => a + b, 0)).toBe(RECORDS.length);
  });

  it('recounts when the store changes', () => {
    const fixture = render();
    const store = TestBed.inject(RecordsStore);
    store.update({ ...store.all()[0], [MODULE_INFO.statusField]: 'Brand New Status' });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Brand New Status');
  });
});
