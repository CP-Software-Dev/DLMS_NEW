import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShipmentListComponent } from './shipment-list.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ShipmentListComponent', () => {
  let component: ShipmentListComponent;
  let fixture: ComponentFixture<ShipmentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShipmentListComponent],
      imports: [HttpClientTestingModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShipmentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
