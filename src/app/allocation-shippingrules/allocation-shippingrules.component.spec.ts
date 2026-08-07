import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllocationShippingrulesComponent } from './allocation-shippingrules.component';

describe('AllocationShippingrulesComponent', () => {
  let component: AllocationShippingrulesComponent;
  let fixture: ComponentFixture<AllocationShippingrulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AllocationShippingrulesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AllocationShippingrulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
