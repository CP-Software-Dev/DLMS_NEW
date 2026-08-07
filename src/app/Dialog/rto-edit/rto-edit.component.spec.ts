import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RtoEditComponent } from './rto-edit.component';

describe('RtoEditComponent', () => {
  let component: RtoEditComponent;
  let fixture: ComponentFixture<RtoEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RtoEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RtoEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
