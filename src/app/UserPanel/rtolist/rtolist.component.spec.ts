import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RtolistComponent } from './rtolist.component';

describe('RtolistComponent', () => {
  let component: RtolistComponent;
  let fixture: ComponentFixture<RtolistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RtolistComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RtolistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
