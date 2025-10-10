import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarrierSummaryComponent } from './carrier-summary.component';

describe('CarrierSummaryComponent', () => {
  let component: CarrierSummaryComponent;
  let fixture: ComponentFixture<CarrierSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CarrierSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarrierSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
