import { TestBed } from '@angular/core/testing';

import { RtoStateService } from './rto-state.service';

describe('RtoStateService', () => {
  let service: RtoStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RtoStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
