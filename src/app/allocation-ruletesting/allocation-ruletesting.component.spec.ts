import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllocationRuletestingComponent } from './allocation-ruletesting.component';

describe('AllocationRuletestingComponent', () => {
  let component: AllocationRuletestingComponent;
  let fixture: ComponentFixture<AllocationRuletestingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AllocationRuletestingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AllocationRuletestingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
