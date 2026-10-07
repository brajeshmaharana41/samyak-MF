import { TestBed } from '@angular/core/testing';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData, openConfirmDialog } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  const ref = { close: vi.fn() };

  async function render(data: ConfirmDialogData) {
    ref.close.mockReset();
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
      providers: [
        { provide: DynamicDialogRef, useValue: ref },
        { provide: DynamicDialogConfig, useValue: { data } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  const buttons = (el: HTMLElement) => el.querySelectorAll<HTMLButtonElement>('p-button button');

  it('shows the message with default button labels', async () => {
    const el = await render({ title: 'Approve?', message: 'Approve this bank?' });
    expect(el.querySelector('.message')?.textContent).toBe('Approve this bank?');
    expect([...buttons(el)].map((b) => b.textContent?.trim())).toEqual(['Cancel', 'Confirm']);
  });

  it('closes with true on confirm and false on cancel', async () => {
    const el = await render({ title: 'Disable?', message: 'Sure?', confirmLabel: 'Disable', danger: true });

    buttons(el)[1].click();
    expect(ref.close).toHaveBeenLastCalledWith(true);

    buttons(el)[0].click();
    expect(ref.close).toHaveBeenLastCalledWith(false);
  });
});

describe('openConfirmDialog', () => {
  it('opens the shared dialog and emits true only for a confirmed close', () => {
    const onClose = new Subject<unknown>();
    const dialogs = { open: vi.fn(() => ({ onClose })) } as unknown as DialogService;
    const results: boolean[] = [];

    openConfirmDialog(dialogs, { title: 'Approve?', message: '...' }).subscribe((ok) => results.push(ok));
    onClose.next(true);
    onClose.next(undefined); // closed with the X button

    expect(dialogs.open).toHaveBeenCalledWith(ConfirmDialogComponent, expect.objectContaining({ header: 'Approve?' }));
    expect(results).toEqual([true, false]);
  });

  it('throws when the dialog cannot be opened', () => {
    const dialogs = { open: () => null } as unknown as DialogService;
    expect(() => openConfirmDialog(dialogs, { title: 'x', message: 'y' })).toThrow('Could not open confirm dialog');
  });
});
