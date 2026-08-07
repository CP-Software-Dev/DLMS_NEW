import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AllocationComponent } from './allocation.component';
import { AllocationRuletestingComponent } from '../allocation-ruletesting/allocation-ruletesting.component';
import { AllocationShippingrulesComponent } from '../allocation-shippingrules/allocation-shippingrules.component';

describe('AllocationComponent', () => {
  let component: AllocationComponent;
  let fixture: ComponentFixture<AllocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AllocationComponent,
        AllocationShippingrulesComponent,
        AllocationRuletestingComponent
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AllocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
