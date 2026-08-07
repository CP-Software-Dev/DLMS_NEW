import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditpriorityComponent } from './editpriority.component';

describe('EditpriorityComponent', () => {
  let component: EditpriorityComponent;
  let fixture: ComponentFixture<EditpriorityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditpriorityComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditpriorityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
