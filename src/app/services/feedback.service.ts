// src/app/services/feedback.service.ts

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private BASE_URL = 'http://your-backend-domain/api/feedback';

  constructor(private http: HttpClient) {}

  getStudentFeedback(studentId: string): Observable<any> {
    return this.http.get(`/api/feedback/student/${studentId}`);
  }

  getFeedbackByStudentId(studentId: string): Observable<any> {
    return this.http.get(`/api/feedback/student/${studentId}`);
  }


  
}
