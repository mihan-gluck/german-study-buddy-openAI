import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentAssignedAssignmentsComponent } from './student-assigned-assignments.component';

describe('StudentAssignedAssignmentsComponent', () => {
  let component: StudentAssignedAssignmentsComponent;
  let fixture: ComponentFixture<StudentAssignedAssignmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentAssignedAssignmentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentAssignedAssignmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
