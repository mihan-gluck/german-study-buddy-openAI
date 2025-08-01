// teacher.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  private baseUrl = '/api/teacher'; // Adjust if your route prefix is different

  constructor(private http: HttpClient) {}

  // Get logged-in teacher profile
  getTeacherProfile(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/profile`);
  }

  // You can add more teacher-related methods here in future
}
