import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherNotificationsComponent } from './teacher-notifications.component';

describe('TeacherNotificationsComponent', () => {
  let component: TeacherNotificationsComponent;
  let fixture: ComponentFixture<TeacherNotificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherNotificationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeacherNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
