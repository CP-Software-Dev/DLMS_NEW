import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewwarehouseComponent } from './newwarehouse.component';

describe('NewwarehouseComponent', () => {
  let component: NewwarehouseComponent;
  let fixture: ComponentFixture<NewwarehouseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewwarehouseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewwarehouseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
