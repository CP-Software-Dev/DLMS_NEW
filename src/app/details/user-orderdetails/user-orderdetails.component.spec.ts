import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserOrderdetailsComponent } from './user-orderdetails.component';

describe('UserOrderdetailsComponent', () => {
  let component: UserOrderdetailsComponent;
  let fixture: ComponentFixture<UserOrderdetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserOrderdetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserOrderdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
