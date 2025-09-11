import { Component, OnInit } from '@angular/core';
import { CoursesService } from '../../services/courses.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router'; 

// Define a Course interface
interface Course {
  _id: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-course-create',
  imports: [FormsModule, CommonModule, HttpClientModule],
  standalone: true,
  templateUrl: './course-create.component.html',
  styleUrls: ['./course-create.component.css']
})

export class CreateCourseComponent implements OnInit {
  courses: Course[] = [];
  course: Course = {
    _id: '',
    title: '',
    description: ''
  };

  constructor(private coursesService: CoursesService, private router: Router) {}

  ngOnInit(): void {
  }

  // Create a new course through the API
  createCourse(): void {
  this.coursesService.addCourse(this.course).subscribe({
    next: (response) => {
      // Show success alert
      alert('Course created successfully!');

      // Navigate to the courses list page
      this.router.navigate(['/courses']);
    },
    error: (error) => {
      console.error('Error creating course', error);
      alert('Failed to create course. Please try again.');
    }
  });
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
