import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HellpbtnComponent } from './hellpbtn.component';

describe('HellpbtnComponent', () => {
  let component: HellpbtnComponent;
  let fixture: ComponentFixture<HellpbtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HellpbtnComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HellpbtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
