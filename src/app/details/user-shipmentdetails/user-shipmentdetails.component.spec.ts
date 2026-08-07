import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserShipmentdetailsComponent } from './user-shipmentdetails.component';

describe('UserShipmentdetailsComponent', () => {
  let component: UserShipmentdetailsComponent;
  let fixture: ComponentFixture<UserShipmentdetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserShipmentdetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserShipmentdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
