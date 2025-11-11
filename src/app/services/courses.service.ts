// src/app/services/courses.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Define a Course interface
export interface Course {
  _id?: string;
  title: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class CoursesService {
  private apiUrl = `${environment.apiUrl}/courses`; // Adjust this to match your backend API

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

  // Fetch a specific course by ID
  getCourseById(courseId: string): Observable<Course> {
    return this.http.get<Course>(`${this.apiUrl}/${courseId}`);
  }

  // Update a course
  updateCourse(courseId: string, course: Partial<Course>): Observable<Course> {
    return this.http.put<Course>(`${this.apiUrl}/${courseId}`, course);
  }

  // Delete a course
  deleteCourse(courseId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${courseId}`);
  }

}
