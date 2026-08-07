import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { OrdersModule } from '../graphs/orders-graph/orders-graph.module';
import { ShipmentModule } from '../graphs/shipments-graph/shipments-graph.module';
import { ReactiveFormsModule } from '@angular/forms'; 

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      imports: [MatFormFieldModule,
        MatDatepickerModule,
        ReactiveFormsModule,
        MatNativeDateModule,
        NoopAnimationsModule,
        OrdersModule,
        ShipmentModule
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
