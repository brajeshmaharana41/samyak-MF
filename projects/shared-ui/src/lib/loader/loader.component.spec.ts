import { TestBed } from '@angular/core/testing';
import { LoaderService } from '@samyak/shared-services';
import { LoaderComponent } from './loader.component';

describe('LoaderComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LoaderComponent] }).compileComponents();
  });

  it('shows the overlay only while LoaderService is loading', () => {
    const loader = TestBed.inject(LoaderService);
    const fixture = TestBed.createComponent(LoaderComponent);
    const overlay = () => fixture.nativeElement.querySelector('.overlay');

    fixture.detectChanges();
    expect(overlay()).toBeNull();

    loader.show();
    fixture.detectChanges();
    expect(overlay()).not.toBeNull();

    loader.hide();
    fixture.detectChanges();
    expect(overlay()).toBeNull();
  });
});
