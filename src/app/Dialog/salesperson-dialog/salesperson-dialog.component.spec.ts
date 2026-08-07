import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalespersonDialogComponent } from './salesperson-dialog.component';

describe('SalespersonDialogComponent', () => {
  let component: SalespersonDialogComponent;
  let fixture: ComponentFixture<SalespersonDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SalespersonDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SalespersonDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
