import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRtoComponent } from './user-rto.component';

describe('UserRtoComponent', () => {
  let component: UserRtoComponent;
  let fixture: ComponentFixture<UserRtoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserRtoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserRtoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
