import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NszPageComponent } from './nsz-page.component';

describe('NszPageComponent', () => {
  let component: NszPageComponent;
  let fixture: ComponentFixture<NszPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NszPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NszPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
