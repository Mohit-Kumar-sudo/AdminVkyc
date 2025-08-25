import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarrierFormComponent } from './carrier-form.component';

describe('CarrierFormComponent', () => {
  let component: CarrierFormComponent;
  let fixture: ComponentFixture<CarrierFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CarrierFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CarrierFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
