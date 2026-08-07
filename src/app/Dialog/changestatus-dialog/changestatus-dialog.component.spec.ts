import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ChangestatusDialogComponent } from './changestatus-dialog.component';
import { ToastrModule } from 'ngx-toastr';
import { MatDialogModule , MatDialogRef , MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

describe('ChangestatusDialogComponent', () => {
  let component: ChangestatusDialogComponent;
  let fixture: ComponentFixture<ChangestatusDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChangestatusDialogComponent],
      imports: [ToastrModule.forRoot(),
        MatDialogModule,
        HttpClientTestingModule,
        BrowserAnimationsModule,
        FormsModule
      ],
      providers: [{provide: MatDialogRef,
        useValue: {}} ,
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChangestatusDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
