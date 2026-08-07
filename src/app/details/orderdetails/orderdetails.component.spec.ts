import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { OrderdetailsComponent } from './orderdetails.component';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

describe('OrderdetailsComponent', () => {
  let component: OrderdetailsComponent;
  let fixture: ComponentFixture<OrderdetailsComponent>;

  const activatedRouteStub = {
    paramMap: new BehaviorSubject({
      get: (key: string) => 'some-id' // Mocked parameter
    })
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrderdetailsComponent],
      imports: [HttpClientTestingModule],
      providers: [
         { provide: ActivatedRoute, useValue: activatedRouteStub }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrderdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
