// src/app/services/course-progress.service.ts


import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

interface CourseProgress {
  courseId: { _id: string; name: string };
  progressPercentage: number;
  lastUpdated: string;
}

@Injectable({
  providedIn: 'root'
})
export class CourseProgressService {
  private apiUrl = 'http://localhost:4000/api/student';  // update if hosted elsewhere

  constructor(private http: HttpClient) {}

  getProgress(): Observable<CourseProgress[]> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<CourseProgress[]>(`${this.apiUrl}/progress`, { headers });
  }
}
