import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentsGraphComponent } from './shipments-graph.component';

describe('ShipmentsGraphComponent', () => {
  let component: ShipmentsGraphComponent;
  let fixture: ComponentFixture<ShipmentsGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShipmentsGraphComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShipmentsGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
