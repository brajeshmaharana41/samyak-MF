import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { RECORDS } from './records';

type Row = (typeof RECORDS)[number];

/**
 * Small in-memory mock "backend" for this module.
 * getAll() returns of(data) the way a real HttpClient call would return an Observable,
 * so swapping in a real API later only changes this file.
 */
@Injectable({ providedIn: 'root' })
export class RecordsStore {
  private readonly rows = signal<Row[]>(structuredClone(RECORDS));

  /** Live list for templates. */
  readonly all = this.rows.asReadonly();

  getAll(): Observable<Row[]> {
    return of(this.rows());
  }

  getById(id: string): Row | undefined {
    return this.rows().find((r) => r.id === id);
  }

  update(changed: Row): void {
    this.rows.update((list) => list.map((r) => (r.id === changed.id ? changed : r)));
  }
}
