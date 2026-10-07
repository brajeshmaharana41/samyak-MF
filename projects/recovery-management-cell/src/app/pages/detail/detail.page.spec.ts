import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { COLUMNS, MODULE_INFO, RECORDS } from '../../data/records';
import { DetailPage } from './detail.page';

describe('DetailPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailPage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  function render(id: string) {
    const fixture = TestBed.createComponent(DetailPage);
    fixture.componentRef.setInput('id', id);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows the record that matches the :id', () => {
    const record = RECORDS[0];
    const el = render(record.id);

    expect(el.querySelector('h1')?.textContent).toBe(String(record[MODULE_INFO.titleField]));
    expect(el.querySelectorAll('dt').length).toBe(COLUMNS.length);
    expect(el.querySelector('dl')?.textContent).toContain(String(record[MODULE_INFO.titleField]));
  });

  it('shows a "not found" message for an unknown id', () => {
    const el = render('NOPE-999');
    expect(el.querySelector('h1')?.textContent).toBe('Not found');
    expect(el.textContent).toContain('found with id "NOPE-999"');
  });
});
