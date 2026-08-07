import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MemberServiceService } from '../../services/member-service.service';
import { UserlistComponent } from './userlist.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('UserlistComponent', () => {
  let component: UserlistComponent;
  let fixture: ComponentFixture<UserlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MemberServiceService],
      declarations: [UserlistComponent
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
