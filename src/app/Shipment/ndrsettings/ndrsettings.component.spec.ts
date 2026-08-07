import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NdrsettingsComponent } from './ndrsettings.component';

describe('NdrsettingsComponent', () => {
  let component: NdrsettingsComponent;
  let fixture: ComponentFixture<NdrsettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NdrsettingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NdrsettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
