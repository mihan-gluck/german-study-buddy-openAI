import { Component, OnInit } from '@angular/core';
import { CoursesService } from '../../services/courses.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

// Define a Course interface
interface Course {
  _id: string;
  title: string;
  description: string;
}

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
}
