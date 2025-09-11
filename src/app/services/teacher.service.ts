// teacher.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

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


  // ✅ Get students assigned to the logged-in teacher
  getAssignedStudents(): Observable<any> {
  const token = localStorage.getItem('authToken');
  console.log('Retrieved token:', token); // Debugging line
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.get<any>(`${this.baseUrl}/students`, { headers });
}
}
