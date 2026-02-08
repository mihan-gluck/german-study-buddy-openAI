import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentExamsComponentTsComponent } from './student-exams.component';

describe('StudentExamsComponentTsComponent', () => {
  let component: StudentExamsComponentTsComponent;
  let fixture: ComponentFixture<StudentExamsComponentTsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentExamsComponentTsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentExamsComponentTsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
