// src/app/services/vapi-usage.service.ts

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// Interface for VAPI usage log
export interface VapiUsageData {
  course: string;
  assistantID: string;
  duration: number;       // in seconds
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class VapiUsageService {
  private apiUrl = '/api/vapi-usage'; // base endpoint, can be made dynamic

  constructor(private http: HttpClient) {}

  /**
   * Logs the VAPI usage data to the backend
   * @param data VapiUsageData object
   */
  logUsage(data: VapiUsageData): void {
    this.http.post(this.apiUrl, data).subscribe({
      next: () => console.log('✅ VAPI usage logged successfully'),
      error: (err) => console.error('❌ Failed to log VAPI usage:', err)
    });
  }

  /**
   * Optional: Returns Observable in case you want to subscribe externally
   */
  logUsage$ (data: VapiUsageData): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}

