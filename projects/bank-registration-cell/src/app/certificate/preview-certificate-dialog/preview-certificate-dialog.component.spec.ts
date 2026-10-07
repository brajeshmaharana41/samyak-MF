import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { RECORDS } from '../../data/records';
import { PreviewCertificateDialogComponent } from './preview-certificate-dialog.component';

describe('PreviewCertificateDialogComponent', () => {
  const record = RECORDS[0];
  let fixture: ComponentFixture<PreviewCertificateDialogComponent>;
  let el: HTMLElement;
  const ref = { close: vi.fn() };

  beforeEach(async () => {
    ref.close.mockReset();
    // PDF.js needs a real canvas and Web Worker, which jsdom does not have.
    // These tests cover the dialog around it, so skip the rendering step.
    vi.spyOn(PreviewCertificateDialogComponent.prototype, 'ngOnInit').mockResolvedValue();

    await TestBed.configureTestingModule({
      imports: [PreviewCertificateDialogComponent],
      providers: [
        { provide: DynamicDialogRef, useValue: ref },
        { provide: DynamicDialogConfig, useValue: { data: record } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PreviewCertificateDialogComponent);
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  afterEach(() => vi.restoreAllMocks());

  it('shows a spinner and disables Download while the PDF loads', () => {
    expect(el.querySelector('p-progress-spinner')).not.toBeNull();
    expect(el.querySelector<HTMLButtonElement>('p-button[label="Download"] button')?.disabled).toBe(true);
  });

  it('downloads the certificate with a file name based on the record id', () => {
    URL.createObjectURL = vi.fn(() => 'blob:certificate');
    URL.revokeObjectURL = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.download).toBe(`${record.id}-registration-certificate.pdf`);
      expect(this.href).toBe('blob:certificate');
    });

    fixture.componentInstance['download']();

    expect(click).toHaveBeenCalledOnce();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:certificate');
  });

  it('closes on Close', () => {
    el.querySelector<HTMLButtonElement>('p-button[label="Close"] button')!.click();
    expect(ref.close).toHaveBeenCalled();
  });
});
