import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IssueticketsComponent } from './issuetickets.component';

describe('IssueticketsComponent', () => {
  let component: IssueticketsComponent;
  let fixture: ComponentFixture<IssueticketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IssueticketsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IssueticketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
