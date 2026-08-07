import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadBranchOrdersComponent } from './upload-branch-orders.component';

describe('UploadBranchOrdersComponent', () => {
  let component: UploadBranchOrdersComponent;
  let fixture: ComponentFixture<UploadBranchOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UploadBranchOrdersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UploadBranchOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
