import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserorderReportsComponent } from './userorder-reports.component';

describe('UserorderReportsComponent', () => {
  let component: UserorderReportsComponent;
  let fixture: ComponentFixture<UserorderReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserorderReportsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserorderReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
