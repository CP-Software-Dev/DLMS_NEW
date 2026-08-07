import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourierGraphComponent } from './courier-graph.component';

describe('CourierGraphComponent', () => {
  let component: CourierGraphComponent;
  let fixture: ComponentFixture<CourierGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CourierGraphComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CourierGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
