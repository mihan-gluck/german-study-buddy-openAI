import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherAssignmentTemplatesComponent } from './teacher-assignment-templates.component';

describe('TeacherAssignmentTemplatesComponent', () => {
  let component: TeacherAssignmentTemplatesComponent;
  let fixture: ComponentFixture<TeacherAssignmentTemplatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherAssignmentTemplatesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeacherAssignmentTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
