import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { OrderUploadComponent } from './order-upload.component';
import { ToastrModule } from 'ngx-toastr';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

describe('OrderUploadComponent', () => {
  let component: OrderUploadComponent;
  let fixture: ComponentFixture<OrderUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrderUploadComponent],
      imports: [HttpClientTestingModule,
        ToastrModule.forRoot() , MatDialogModule , BrowserAnimationsModule , FormsModule],
      providers: [{
        provide: MatDialogRef,
        useValue: {}
      },
      { provide: MAT_DIALOG_DATA, useValue: {} },
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(OrderUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
