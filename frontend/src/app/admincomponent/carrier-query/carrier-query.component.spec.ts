import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarrierQueryComponent } from './carrier-query.component';

describe('CarrierQueryComponent', () => {
  let component: CarrierQueryComponent;
  let fixture: ComponentFixture<CarrierQueryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CarrierQueryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarrierQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
