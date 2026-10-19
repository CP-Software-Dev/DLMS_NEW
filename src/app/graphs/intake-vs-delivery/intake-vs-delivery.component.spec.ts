import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntakeVsDeliveryComponent } from './intake-vs-delivery.component';

describe('IntakeVsDeliveryComponent', () => {
  let component: IntakeVsDeliveryComponent;
  let fixture: ComponentFixture<IntakeVsDeliveryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IntakeVsDeliveryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IntakeVsDeliveryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
