import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CourierListComponent } from '../courier-list/courier-list.component';
import { CourierDeliveryComponent } from '../courier-delivery/courier-delivery.component';
import { EditCourierComponent } from './edit-courier.component';
import { CourierSettingsComponent } from '../courier-settings/courier-settings.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('EditCourierComponent', () => {
  let component: EditCourierComponent;
  let fixture: ComponentFixture<EditCourierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditCourierComponent ,
        CourierDeliveryComponent,
        CourierSettingsComponent
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditCourierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
