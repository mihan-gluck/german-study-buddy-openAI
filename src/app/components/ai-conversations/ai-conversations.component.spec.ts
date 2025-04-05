import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiConversationsComponent } from './ai-conversations.component';

describe('AiConversationsComponent', () => {
  let component: AiConversationsComponent;
  let fixture: ComponentFixture<AiConversationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiConversationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiConversationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
