import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BulkshipComponent } from './bulkship.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ToastrModule } from 'ngx-toastr';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

describe('BulkshipComponent', () => {
  let component: BulkshipComponent;
  let fixture: ComponentFixture<BulkshipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BulkshipComponent],
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
    
    fixture = TestBed.createComponent(BulkshipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
