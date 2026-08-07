import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserwarehouseReportsComponent } from './userwarehouse-reports.component';

describe('UserwarehouseReportsComponent', () => {
  let component: UserwarehouseReportsComponent;
  let fixture: ComponentFixture<UserwarehouseReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserwarehouseReportsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserwarehouseReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
