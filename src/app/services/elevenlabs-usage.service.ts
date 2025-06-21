// src/app/services/elevenlabs-usage.service.ts

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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
  private apiUrl = '/api/elevenlabs-usage'; // base endpoint

  constructor(private http: HttpClient) {}

  /**
   * Logs ElevenLabs usage to backend
   */
  logUsage(data: ElevenLabsUsageData): void {
    this.http.post(this.apiUrl + '/log', data).subscribe({
      next: () => console.log('✅ ElevenLabs usage logged successfully'),
      error: (err) => console.error('❌ Failed to log ElevenLabs usage:', err)
    });
  }

  /**
   * Optional: Observable-based logging
   */
  logUsage$(data: ElevenLabsUsageData): Observable<any> {
    return this.http.post(this.apiUrl + '/log', data);
  }
}
