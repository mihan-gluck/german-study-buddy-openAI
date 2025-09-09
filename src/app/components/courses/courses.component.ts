import { Component, OnInit } from '@angular/core';
import { CoursesService } from '../../services/courses.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

// Define a Course interface
interface Course {
  _id: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-courses',
  imports: [FormsModule, CommonModule, HttpClientModule],
  standalone: true,
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})

export class CoursesComponent implements OnInit {
  courses: Course[] = [];
  course: Course = {
    _id: '',
    title: '',
    description: ''
  };

  constructor(private coursesService: CoursesService) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  // Fetch all courses from the backend
  loadCourses(): void {
    this.coursesService.getCourses().subscribe(
      (data: Course[]) => {
        this.courses = data; // TypeScript will now know this is an array of Course objects
      },
      (error) => {
        console.error('Error fetching courses', error);
      }
    );
  }

  // Enroll the user in a course
  enroll(courseId: string): void {
    this.coursesService.enrollInCourse(courseId).subscribe(
      (response) => {
        console.log('Enrolled successfully', response);
      },
      (error) => {
        console.error('Error enrolling in course', error);
      }
    );
  }

  // Create a new course through the API
  createCourse(): void {
    this.coursesService.addCourse(this.course).subscribe(
      (response) => {
        console.log('Course created successfully', response);
        // this.loadCourses(); // Reload the course list
        window.location.reload(); 
      },
      (error) => {
        console.error('Error creating course', error);
      }
    );
  }

  // Method for handling form submission
  onSubmit(): void {
    if (this.course.title && this.course.description) {
      this.createCourse();  // Call createCourse() if title and description are filled
    } else {
      console.error('Please fill out the course title and description.');
    }
  }
}
