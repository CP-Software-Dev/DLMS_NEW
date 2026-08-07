import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CourierListComponent } from './courier-list.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('CourierListComponent', () => {
  let component: CourierListComponent;
  let fixture: ComponentFixture<CourierListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CourierListComponent],
      imports: [HttpClientTestingModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CourierListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
