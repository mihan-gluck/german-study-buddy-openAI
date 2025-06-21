// src/app/services/courses.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define a Course interface
interface Course {
  _id: string;
  title: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class CoursesService {
  private apiUrl = 'http://localhost:4000/api/courses'; // Adjust this to match your backend API

  constructor(private http: HttpClient) {}

  // Fetch all courses
  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(this.apiUrl);
  }

  // Add a new course
  addCourse(course: Course): Observable<Course> {
    return this.http.post<Course>(this.apiUrl, course);
  }

  // Enroll in a course
  enrollInCourse(courseId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/enroll`, { courseId });
  }

  // Update course progress
  updateCourseProgress(studentId: string, courseId: string, progress: number) {
  return this.http.put(`/api/teacher/update-course-progress/${studentId}`, {
    courseId,
    progress
  });
}

}
