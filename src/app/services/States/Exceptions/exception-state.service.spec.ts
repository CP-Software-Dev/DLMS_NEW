import { TestBed } from '@angular/core/testing';

import { ExceptionStateService } from './exception-state.service';

describe('ExceptionStateService', () => {
  let service: ExceptionStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExceptionStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
