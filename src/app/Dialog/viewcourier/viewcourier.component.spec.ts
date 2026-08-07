import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewcourierComponent } from './viewcourier.component';

describe('ViewcourierComponent', () => {
  let component: ViewcourierComponent;
  let fixture: ComponentFixture<ViewcourierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewcourierComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewcourierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
