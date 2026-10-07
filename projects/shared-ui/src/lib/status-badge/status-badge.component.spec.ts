import { TestBed } from '@angular/core/testing';
import { StatusBadgeComponent } from './status-badge.component';

describe('StatusBadgeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StatusBadgeComponent] }).compileComponents();
  });

  function render(status: string) {
    const fixture = TestBed.createComponent(StatusBadgeComponent);
    fixture.componentRef.setInput('status', status);
    fixture.detectChanges();
    return fixture;
  }

  it('shows the status as a readable label', () => {
    expect(render('UNDER_REVIEW').nativeElement.textContent).toContain('Under Review');
  });

  it.each([
    ['Approved', 'success'],
    ['Pending', 'warn'],
    ['Rejected', 'danger'],
    ['Submitted', 'info'],
    ['Something else', 'secondary'],
  ])('colours "%s" as %s', (status, severity) => {
    expect(render(status).componentInstance['severity']()).toBe(severity);
  });
});
