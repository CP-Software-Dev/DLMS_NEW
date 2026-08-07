import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RtoChangeStatusComponent } from './rto-change-status.component';

describe('RtoChangeStatusComponent', () => {
  let component: RtoChangeStatusComponent;
  let fixture: ComponentFixture<RtoChangeStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RtoChangeStatusComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RtoChangeStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
