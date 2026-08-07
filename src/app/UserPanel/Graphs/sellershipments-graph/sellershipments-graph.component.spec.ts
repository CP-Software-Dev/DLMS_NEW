import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellershipmentsGraphComponent } from './sellershipments-graph.component';

describe('SellershipmentsGraphComponent', () => {
  let component: SellershipmentsGraphComponent;
  let fixture: ComponentFixture<SellershipmentsGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SellershipmentsGraphComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SellershipmentsGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
