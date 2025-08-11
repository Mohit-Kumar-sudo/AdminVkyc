import { TestBed } from '@angular/core/testing';

import { CarrierQueryService } from './carrier-query.service';

describe('CarrierQueryService', () => {
  let service: CarrierQueryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CarrierQueryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
