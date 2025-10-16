import { Component, OnInit } from '@angular/core';
import { CoursesService } from '../../services/courses.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { Course } from '../../services/courses.service';

@Component({
  selector: 'app-courses',
  imports: [FormsModule, CommonModule, HttpClientModule, RouterModule],
  standalone: true,
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit {
  courses: Course[] = [];

  constructor(private coursesService: CoursesService) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  // Fetch all courses from the backend
  loadCourses(): void {
    this.coursesService.getCourses().subscribe(
      (data: Course[]) => {
        this.courses = data; 
      },
      (error) => {
        console.error('Error fetching courses', error);
      }
    );
  }

  // Delete a course
  deleteCourse(courseId: string): void {
    const confirmed = confirm('Are you sure you want to delete this course?');

    if (confirmed) {
      this.coursesService.deleteCourse(courseId).subscribe({
        next: () => {
          this.courses = this.courses.filter(course => course._id !== courseId);
          alert('Course deleted successfully.');
        },
        error: (error) => {
          console.error('Error deleting course', error);
          alert('Failed to delete the course. Please try again.');
        }
      });
    }
  }
}
