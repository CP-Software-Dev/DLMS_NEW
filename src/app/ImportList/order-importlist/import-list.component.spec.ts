import { ComponentFixture, TestBed } from '@angular/core/testing';
import {HttpClientModule} from '@angular/common/http';
import { ImportListComponent } from './import-list.component';

describe('ImportListComponent', () => {
  let component: ImportListComponent;
  let fixture: ComponentFixture<ImportListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImportListComponent],
      imports:[HttpClientModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImportListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
