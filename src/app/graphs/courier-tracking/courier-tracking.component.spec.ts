import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourierTrackingComponent } from './courier-tracking.component';

describe('CourierTrackingComponent', () => {
  let component: CourierTrackingComponent;
  let fixture: ComponentFixture<CourierTrackingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CourierTrackingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CourierTrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
