import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddCourierComponent } from './add-courier.component';
import { ToastrModule } from 'ngx-toastr';
import { MatDialogModule , MatDialogRef , MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AddCourierComponent', () => {
  let component: AddCourierComponent;
  let fixture: ComponentFixture<AddCourierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddCourierComponent],
      imports : [ToastrModule.forRoot(),
        MatDialogModule,
        HttpClientTestingModule,
        BrowserAnimationsModule,
        FormsModule],
        providers: [{provide: MatDialogRef,
          useValue: {}} ,
          { provide: MAT_DIALOG_DATA, useValue: {} },
        ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddCourierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
