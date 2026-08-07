import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CouriersComponent } from './couriers.component';

describe('CouriersComponent', () => {
  let component: CouriersComponent;
  let fixture: ComponentFixture<CouriersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CouriersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CouriersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
