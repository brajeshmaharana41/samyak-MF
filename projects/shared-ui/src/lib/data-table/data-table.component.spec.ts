import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Menu } from 'primeng/menu';
import { DataTableComponent } from './data-table.component';
import { TableAction, TableActionEvent, TableColumn } from './table.model';

describe('DataTableComponent', () => {
  const columns: TableColumn[] = [
    { field: 'id', header: 'ID', sortable: true },
    { field: 'name', header: 'Name' },
    { field: 'amount', header: 'Amount', type: 'currency' },
    { field: 'status', header: 'Status', type: 'status' },
  ];
  const rows = [
    { id: 'R1', name: 'State Bank of India', amount: 1250000, status: 'Pending' },
    { id: 'R2', name: 'HDFC Bank', amount: 500, status: 'Approved' },
  ];
  const actions: TableAction[] = [
    { key: 'view', label: 'View', icon: 'pi pi-eye' },
    { key: 'approve', label: 'Approve', visible: (r) => r.status === 'Pending' },
  ];

  let fixture: ComponentFixture<DataTableComponent>;
  let el: HTMLElement;

  async function render(data: unknown[], withActions = actions) {
    await TestBed.configureTestingModule({ imports: [DataTableComponent] }).compileComponents();
    fixture = TestBed.createComponent(DataTableComponent);
    fixture.componentRef.setInput('columns', columns);
    fixture.componentRef.setInput('data', data);
    fixture.componentRef.setInput('actions', withActions);
    fixture.detectChanges();
    el = fixture.nativeElement;
  }

  const headers = () => [...el.querySelectorAll('thead th')].map((th) => th.textContent?.trim());

  it('renders one header per column plus an Actions column', async () => {
    await render(rows);
    expect(headers()).toEqual(['ID', 'Name', 'Amount', 'Status', 'Actions']);
  });

  it('has no Actions column when there are no actions', async () => {
    await render(rows, []);
    expect(headers()).not.toContain('Actions');
  });

  it('renders a row per record, formatting currency and status cells', async () => {
    await render(rows);
    const bodyRows = el.querySelectorAll('tbody tr');
    expect(bodyRows.length).toBe(2);
    expect(bodyRows[0].textContent).toContain('₹12,50,000');
    expect(bodyRows[0].querySelector('samyak-status-badge')).not.toBeNull();
    expect(el.querySelector('.count')?.textContent).toBe('2 records');
  });

  it('shows a message when there is no data', async () => {
    await render([]);
    expect(el.querySelector('.empty')?.textContent).toBe('No records found.');
  });

  it('only reports the clicked action and row; it decides nothing itself', async () => {
    await render(rows);
    const emitted: TableActionEvent[] = [];
    fixture.componentInstance.actionClick.subscribe((e) => emitted.push(e));
    const menu = fixture.debugElement.query(By.directive(Menu)).componentInstance as Menu;

    // Open the menu of the second row (Approved): "Approve" must be hidden there.
    el.querySelectorAll<HTMLButtonElement>('td.actions-col button')[1].click();
    expect(menu.model?.map((i) => i.label)).toEqual(['View']);

    menu.model![0].command!({});
    expect(emitted).toEqual([{ action: 'view', row: rows[1] }]);
  });
});
