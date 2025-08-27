// src/app/services/student.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = 'http://localhost:4000/api/profile';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getStudentProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`, { headers: this.getAuthHeaders() });
  }

  getVapiAccess(): Observable<any> {
    return this.http.get(`${this.apiUrl}/vapi-access`, { headers: this.getAuthHeaders() });
  }

  getElevenLabsAccess(): Observable<any> {
    return this.http.get(`${this.apiUrl}/elevenlabs-access`, { headers: this.getAuthHeaders() });
  }
}
