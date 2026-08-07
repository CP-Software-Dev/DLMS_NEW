import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebhookViewComponent } from './webhook-view.component';

describe('WebhookViewComponent', () => {
  let component: WebhookViewComponent;
  let fixture: ComponentFixture<WebhookViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WebhookViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WebhookViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
