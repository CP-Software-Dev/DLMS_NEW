import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AwbstatusComponent } from './awbstatus.component';

describe('AwbstatusComponent', () => {
  let component: AwbstatusComponent;
  let fixture: ComponentFixture<AwbstatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AwbstatusComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AwbstatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
