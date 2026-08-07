import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellercourierGraphComponent } from './sellercourier-graph.component';

describe('SellercourierGraphComponent', () => {
  let component: SellercourierGraphComponent;
  let fixture: ComponentFixture<SellercourierGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SellercourierGraphComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SellercourierGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
