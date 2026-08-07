import { TestBed } from '@angular/core/testing';

import { ShipmentStateService } from './shipment-state.service';

describe('ShipmentStateService', () => {
  let service: ShipmentStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShipmentStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
