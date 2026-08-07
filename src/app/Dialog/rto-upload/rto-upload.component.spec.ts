import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RtoUploadComponent } from './rto-upload.component';

describe('RtoUploadComponent', () => {
  let component: RtoUploadComponent;
  let fixture: ComponentFixture<RtoUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RtoUploadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RtoUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
