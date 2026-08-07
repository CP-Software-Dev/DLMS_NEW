import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NdrnewComponent } from './ndrnew.component';

describe('NdrnewComponent', () => {
  let component: NdrnewComponent;
  let fixture: ComponentFixture<NdrnewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NdrnewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NdrnewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
