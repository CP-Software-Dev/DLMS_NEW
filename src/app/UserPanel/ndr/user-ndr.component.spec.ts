import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserNdrComponent } from './user-ndr.component';

describe('UserNdrComponent', () => {
  let component: UserNdrComponent;
  let fixture: ComponentFixture<UserNdrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserNdrComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserNdrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
