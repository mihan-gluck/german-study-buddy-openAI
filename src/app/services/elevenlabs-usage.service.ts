// src/app/services/elevenlabs-usage.service.ts

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AuthService } from './auth.service';

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
  private apiUrl = 'http://localhost:4000/api/elevenlabs-usage'; // base endpoint

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
    const token = this.authService.getToken();
    if (!token) {
      console.error('❌ No token found in localStorage');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // ✅ Correct endpoint matches backend: /api/elevenlabs-usage/apiKey
    const endpoint = studentId
      ? `${this.apiUrl}/apiKey/${studentId}`
      : `${this.apiUrl}/apiKey`;

    return this.http.get<any>(endpoint, { headers });
  }

  // Get ElevenLabs usage by API key (Admin)

  getUsageByApiKey(apiKey: string): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get(`/api/elevenlabs-usage/admin/usage/${apiKey}`, { headers });
  }

  /**
   * Optional: Observable-based logging
   */
  logUsage$(data: ElevenLabsUsageData): Observable<any> {
    return this.http.post(`${this.apiUrl}/log`, data);
  }
}
