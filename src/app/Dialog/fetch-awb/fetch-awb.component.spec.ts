import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FetchAWBComponent } from './fetch-awb.component';
import { MatDialogModule, MAT_DIALOG_DATA ,MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
describe('FetchAWBComponent', () => {
  let component: FetchAWBComponent;
  let fixture: ComponentFixture<FetchAWBComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FetchAWBComponent],
      imports: [MatDialogModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} }
      
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FetchAWBComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
