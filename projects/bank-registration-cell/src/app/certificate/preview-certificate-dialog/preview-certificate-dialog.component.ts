import { Component, ElementRef, OnDestroy, OnInit, inject, signal, viewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import type { PDFDocumentLoadingTask } from 'pdfjs-dist';
import { BankRegistration } from '../data/records';
import { buildCertificatePdf } from './certificate-pdf';

/**
 * BRC-only feature that uses a BRC-only npm library: pdfjs-dist (Mozilla PDF.js).
 *
 * How the library stays private to BRC:
 *  1. federation.config.js lists 'pdfjs-dist' under `skip`, so it is NOT a shared singleton;
 *     it is bundled into BRC's own files.
 *  2. It is loaded with a dynamic import() below, so even BRC users only download it
 *     when they actually open a preview.
 *  3. PDF.js runs in a Web Worker loaded from a separate file. That file is copied into BRC's build
 *     (angular.json → bank-registration-cell assets → "pdfjs/pdf.worker.min.mjs").
 *
 * IMPORTANT for remotes: we locate the worker with `new URL(..., import.meta.url)`, i.e.
 * relative to THIS remote's JavaScript file. A plain '/pdfjs/...' or 'assets/...' path would
 * be resolved against the SHELL's address and fail when BRC runs inside the shell.
 */
@Component({
  selector: 'brc-preview-certificate-dialog',
  imports: [ButtonModule, ProgressSpinnerModule],
  template: `
    @if (loading()) {
      <div class="center"><p-progress-spinner strokeWidth="4" ariaLabel="Loading PDF" /></div>
    }
    @if (error()) {
      <p class="error">{{ error() }}</p>
    }
    <div class="viewer" [hidden]="loading() || !!error()">
      <canvas #canvas></canvas>
    </div>
    <div class="buttons">
      <span class="info">Rendered with PDF.js ({{ pages() }} page) · loaded only by BRC</span>
      <p-button label="Download" icon="pi pi-download" severity="secondary" [outlined]="true" (onClick)="download()" [disabled]="loading()" />
      <p-button label="Close" (onClick)="ref.close()" />
    </div>
  `,
  styles: `
    .center { display: grid; place-items: center; height: 24rem; }
    .viewer { max-height: 65vh; overflow: auto; background: #e5e7eb; padding: 1rem; border-radius: 8px; text-align: center; }
    canvas { max-width: 100%; height: auto; box-shadow: 0 2px 10px rgba(0,0,0,.2); background: #fff; }
    .buttons { display: flex; justify-content: flex-end; align-items: center; gap: .5rem; margin-top: 1rem; flex-wrap: wrap; }
    .info { margin-right: auto; color: #6b7280; font-size: .85rem; }
    .error { color: #dc2626; }
  `,
})
export class PreviewCertificateDialogComponent implements OnInit, OnDestroy {
  protected readonly ref = inject(DynamicDialogRef);
  private readonly record = inject(DynamicDialogConfig).data as BankRegistration;
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly pages = signal(0);

  private readonly pdfBytes = buildCertificatePdf(this.record);
  private loadingTask?: PDFDocumentLoadingTask;

  async ngOnInit(): Promise<void> {
    try {
      // Loaded on demand, from BRC's own chunk files.
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs/pdf.worker.min.mjs', import.meta.url).href;

      // PDF.js takes ownership of the buffer it gets, so pass a copy.
      this.loadingTask = pdfjs.getDocument({ data: this.pdfBytes.slice() });
      const doc = await this.loadingTask.promise;
      this.pages.set(doc.numPages);

      const page = await doc.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = this.canvas().nativeElement;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvas, viewport }).promise;
    } catch (e) {
      console.error(e);
      this.error.set('Could not render the certificate.');
    } finally {
      this.loading.set(false);
    }
  }

  protected download(): void {
    const url = URL.createObjectURL(new Blob([this.pdfBytes.slice()], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.record.id}-registration-certificate.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  ngOnDestroy(): void {
    // Frees the document and stops the PDF.js worker.
    void this.loadingTask?.destroy();
  }
}
