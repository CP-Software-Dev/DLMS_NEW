import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourierSettingsComponent } from './courier-settings.component';

describe('CourierSettingsComponent', () => {
  let component: CourierSettingsComponent;
  let fixture: ComponentFixture<CourierSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CourierSettingsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CourierSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
