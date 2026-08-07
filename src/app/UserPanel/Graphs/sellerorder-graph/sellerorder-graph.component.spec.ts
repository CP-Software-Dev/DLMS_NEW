import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellerorderGraphComponent } from './sellerorder-graph.component';

describe('SellerorderGraphComponent', () => {
  let component: SellerorderGraphComponent;
  let fixture: ComponentFixture<SellerorderGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SellerorderGraphComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SellerorderGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
