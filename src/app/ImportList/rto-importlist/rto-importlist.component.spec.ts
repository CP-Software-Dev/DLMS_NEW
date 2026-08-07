import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RtoImportlistComponent } from './rto-importlist.component';

describe('RtoImportlistComponent', () => {
  let component: RtoImportlistComponent;
  let fixture: ComponentFixture<RtoImportlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RtoImportlistComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RtoImportlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
