import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagecourierComponent } from './managecourier.component';

describe('ManagecourierComponent', () => {
  let component: ManagecourierComponent;
  let fixture: ComponentFixture<ManagecourierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManagecourierComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManagecourierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
