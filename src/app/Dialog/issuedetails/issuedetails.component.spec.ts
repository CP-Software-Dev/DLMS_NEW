import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IssuedetailsComponent } from './issuedetails.component';

describe('IssuedetailsComponent', () => {
  let component: IssuedetailsComponent;
  let fixture: ComponentFixture<IssuedetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IssuedetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IssuedetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
