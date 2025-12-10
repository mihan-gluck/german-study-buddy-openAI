// src/app/services/elevenlabs-usage.service.ts

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface ElevenLabsUsageData {
  course: string;
  assistantID: string;
  duration: number;       // in seconds
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ElevenLabsUsageService {
  private apiUrl = `${environment.apiUrl}/elevenlabs-usage`; // base endpoint

  constructor(private http: HttpClient, private authService: AuthService) {}

  /**
   * Log ElevenLabs usage
   */
  logUsage(data: ElevenLabsUsageData): void {
    this.http.post(`${this.apiUrl}/log`, data).subscribe({
      next: () => console.log('✅ ElevenLabs usage logged successfully'),
      error: (err) => console.error('❌ Failed to log ElevenLabs usage:', err)
    });
  }

  // Fetch usage data
  getUsage(studentId?: string): Observable<any> {
    const endpoint = studentId
      ? `${this.apiUrl}/apiKey/${studentId}`
      : `${this.apiUrl}/apiKey`;

    return this.http.get<any>(endpoint, { withCredentials: true });
  }


  // Get ElevenLabs usage by API key (Admin)
  getUsageByApiKey(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/usage/${id}`, { withCredentials: true });
  }

  // Optional: Observable-based logging
  logUsage$(data: ElevenLabsUsageData): Observable<any> {
    return this.http.post(`${this.apiUrl}/log`, data, { withCredentials: true });
  }

  // Get ElevenLabs usage by API key (Teacher)
  getUsageByApiKeyForTeacher(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/teacher/usage/${id}`, { withCredentials: true });
  }
}
