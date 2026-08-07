import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PincodeFileUploadComponent } from './pincode-file-upload.component';

describe('PincodeFileUploadComponent', () => {
  let component: PincodeFileUploadComponent;
  let fixture: ComponentFixture<PincodeFileUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PincodeFileUploadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PincodeFileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
