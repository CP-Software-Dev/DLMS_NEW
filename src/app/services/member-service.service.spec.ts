import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MemberServiceService } from './member-service.service';

describe('MemberServiceService', () => {
  let service: MemberServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // Import HttpClientTestingModule here
      providers: [MemberServiceService]
    });
    
    service = TestBed.inject(MemberServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
